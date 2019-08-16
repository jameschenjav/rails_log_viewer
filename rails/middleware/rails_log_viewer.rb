# frozen_string_literal: true

# if Rails.env.development? && Rails.const_defined?('Server')
#   Rails.application.configure do
#     require 'rails_log_viewer'
#     config.middleware.use RailsLogViewer
#   end
# end

class RailsLogViewer
  DEFAULT_PREFIX = '/_rlv/meta/'

  def initialize(app, api_prefix: nil)
    @app = app
    @started = DateTime.now
    @api_prefix = api_prefix.presence || DEFAULT_PREFIX
    @api_prefix += '/' unless @api_prefix.end_with? '/'
    run_client
  end

  def call(env)
    path = env['PATH_INFO']
    return api_call(path[@api_prefix.size..-1]) if path.start_with? @api_prefix

    begin
      @app.call(env)
    rescue StandardError => e
      inspect_exception(e)
      raise e
    end
  end

  private

  def self.started?
    return true if @started

    @started = true
    false
  end

  def inspect_exception(error)
    oe = error.try(:original_exception)
    ActiveSupport::Notifications.instrument(
      'inspect_exception.rails_log_viewer',
      exception: {
        type: error.class.to_s,
        message: error.message,
        backtrace: error.backtrace.reject { |path| path.start_with? __FILE__ },
        original: oe&.class&.to_s
      }
    )
  end

  def api_call(action)
    case action
    when 'models'
      json_response(all_models)
    else
      [404, {}, []]
    end
  rescue StandardError => e
    e
  end

  JSON_HEADER = {
    'Content-Type' => 'application/json',
    'Access-Control-Allow-Origin' => '*'
  }.freeze
  DEFLATE_HEADER = { 'Content-Encoding' => 'deflate' }.freeze

  def json_response(data)
    json = data.to_json
    if json.size < 2000
      [200, { 'Content-Length' => json.size }.merge!(JSON_HEADER), json]
    else
      zipped = Zlib.deflate(json)
      header = { 'Content-Length' => zipped.size }
      [200, header.merge!(JSON_HEADER).merge!(DEFLATE_HEADER), [zipped]]
    end
  end

  def all_models
    Dir.glob(Rails.root.join('app/models/**/*.rb')).sort.each do |filename|
      begin
        require filename
      rescue StandardError
        # do nothing
      end
    end

    models = ActiveRecord::Base.descendants.reject(&:abstract_class?)
    models.map { |m| model_info(m) }.compact.to_h
  end

  def model_info(m)
    relations = m.reflections.map { |rn, rel| ref_info(rn, rel, m) }
    [m.name, {
      table_name: m.table_name,
      pk: m.primary_key,
      columns: m.columns.map { |col| column_info(col) }.to_h,
      relations: relations.compact.to_h
    }]
  end

  def column_info(col)
    [col.name, %i[limit scale precision].map do |key|
      val = col.send(key)
      val && [key, val]
    end.compact.to_h.merge(
      type: col.type,
      default: col.default,
      nullable: col.null,
      sql: col.sql_type
    )]
  end

  def ref_info(rel_name, rel, model)
    [rel_name, {
      ref_class: model.name,
      class_name: rel.class_name,
      collection: rel.collection?,
      macro: rel.macro,
      options: rel.options.map { |k, v| [k, v.to_s] }.to_h,
      plural_name: rel.plural_name
    }]
  rescue StandardError
    nil
  end

  def run_client
    return if Rails.env.production? || self.class.started?

    @id = 0
    @socket = nil
    @events = {}
    @zero_buff = ' ' * CHUNK_SIZE
    @app_path = Rails.root.to_s + '/'
    WATCH_EVENTS.each do |event|
      subscribe(event, method(:process_event))
    end
    check_connection
  end

  WATCH_EVENTS = ([/\w+\.action_view/, /\w+\.active_record/] + %w[
    start_processing.action_controller
    process_action.action_controller
    inspect_exception.rails_log_viewer
  ]).freeze
  CHUNK_SIZE = 8 * 1024

  def send_data(socket, data)
    raw = "#{data}#{@zero_buff[(data.size - CHUNK_SIZE)..-1]}"
    socket.send(raw, 0)
  end

  def connection_message
    return @connection_message if @connection_message

    options = Rails::Server.new.options
    @connection_message = {
      pid: Process.pid.to_s,
      api_prefix: @api_prefix,
      host: options[:Host],
      mode: Rails.env.to_s,
      path: Rails.root.to_s,
      port: options[:Port],
      ruby: RUBY_VERSION,
      started: @started,
      version: Rails.version
    }.to_json.freeze
  end

  def subscribe(event, block)
    ActiveSupport::Notifications.subscribe(event, &block)
  end

  def unsubscribe(event_name)
    ActiveSupport::Notifications.unsubscribe(event_name) if event_name
  end

  def check_connection
    socket = UNIXSocket.new('/tmp/rlv.sock')
    send_data(socket, "#{[-1].pack 'I'}#{connection_message}")
    @socket = socket
  rescue StandardError
    @socket = nil
  end

  def send_log(id, data, started)
    return unless @events.key? id

    begin
      event_log = @events[id]
      if started
        event_log[:started]   ||= started
        event_log[:ts]        ||= timestamp(started)
        event_log[:finished]  ||= Time.now
        event_log[:status]    ||= 500
      end

      split_chunks(event_log.merge(data)) do |chunk|
        send_data(@socket, chunk)
      end
    rescue StandardError
      check_connection
      send_log(id, data, nil) if @socket && started
    ensure
      @events.delete(id)
    end
  end

  CHUNK_LIMIT = CHUNK_SIZE - 32

  def split_chunks(data)
    json = data.to_json
    raw_size = json.size
    if raw_size <= CHUNK_LIMIT
      # 8
      yield "#{signature(1, raw_size)}#{json}"
      return
    end

    zipped = Zlib.deflate json
    zip_size = zipped.size
    return if zip_size >= 0x0100_0000 # 16M

    if zip_size <= CHUNK_LIMIT
      # 12
      yield "#{signature(2, raw_size, zip_size)}#{zipped}"
      return
    end

    chunk_count = ((0.0 + zip_size) / CHUNK_LIMIT).ceil
    # 4 + 4 + 4 + 2
    head = "#{signature(3, raw_size, zip_size)}#{[chunk_count].pack 'S'}"
    chunk_count.times do |index|
      chunk = zipped.slice(index * CHUNK_LIMIT, CHUNK_LIMIT)
      # 14 + 2 + 2
      yield "#{head}#{[index, chunk.size].pack 'S S'}#{chunk}"
    end
  end

  def signature(type, *int32_list)
    @id = (@id + 1) & 0x007F_FFFF
    [type | (@id << 8), *int32_list].pack 'L*'
  end

  def app_stack(raw)
    raw.find_all { |fn| fn.include?(@app_path) && fn.exclude?(__FILE__) }
       .map { |fn| fn[@app_path.size..-1] }
  end

  def process_event(event, started, finished, id, data)
    return unless @socket
    return if event[0] == '!'

    if event == 'start_processing.action_controller'
      @events[id] ||= { ts: timestamp(started), started: started, view: [], orm: [] }
      return
    end

    payload = data.merge(event: event, finished: finished)

    if event == 'process_action.action_controller'
      payload[:controller].safe_constantize&.tap do |c|
        begin
          payload[:source] = c.instance_method(payload[:action]).source_location
        rescue StandardError
        end
      end
      payload[:source] ||= []

      if payload[:exception]
        e = @events[id]
        e&.merge!(payload)
      else
        send_log(id, payload, started)
      end
      return
    end

    if event == 'inspect_exception.rails_log_viewer'
      send_log(id, payload, started)
      return
    end

    e = @events[id]
    return unless e

    payload[:stack] = app_stack(caller)
    payload[:started] = started
    key = if event.match?(/\w+\.action_view/)
            :view
          else
            if event.start_with? 'sql.'
              payload[:binds] = data[:binds].map { |b| [b[0].name, b[1]] }
            end
            :orm
          end
    e[key] << payload
  end

  def timestamp(ts)
    (ts.to_f * 1000).to_i.to_s(36)
  end
end
