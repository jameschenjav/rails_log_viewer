# config.middleware.use RailsLogViewer if Rails.const_defined? 'Server'
class RailsLogViewer
  DEFAULT_PREFIX = '/_rlv/meta/'.freeze

  def initialize(app, api_prefix: nil)
    @app = app
    @started = DateTime.now
    @api_prefix = api_prefix.presence || DEFAULT_PREFIX
    @api_prefix += '/' unless @api_prefix.end_with? '/'
    run_client
  end

  def call(env)
    path = env['PATH_INFO']
    return dispatch_api(path[@api_prefix.size..-1]) if path.start_with? @api_prefix

    begin
      @app.call(env)
    rescue StandardError => e
      oe = e.try(:original_exception)
      ActiveSupport::Notifications.instrument(
        'inspect_exception.rails_log_viewer',
        exception: {
          type: e.class.to_s,
          message: e.message,
          backtrace: e.backtrace.reject { |path| path.start_with? __FILE__ },
          original: oe&.class&.to_s,
        },
      )
      raise(e)
    end
  end

  private

  def dispatch_api(action)
    case action
    when 'models'
      json_response(get_all_models)
    else
      [404, {}, []]
    end
  rescue StandardError => e
    binding.pry
  end

  JSON_HEADER = { 'Content-Type' => 'application/json' }.freeze
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

  def get_all_models
    model_names = Dir.entries(Rails.root.join('app/models'))
                     .map { |fn| fn.end_with?('.rb') ? fn.sub('.rb', '').camelize : nil }
                     .compact
    base_model = defined?(ApplicationRecord) ? ApplicationRecord : ActiveRecord::Base
    model_names.map do |name|
      begin
        model = name.constantize
        next if !(model < base_model) || model.abstract_class?

        [model.name, {
          table_name: model.table_name,
          pk: model.primary_key,
          columns: model.columns.map do |col|
            [col.name, %i[limit scale precision].map do |key|
              val = col.send(key)
              val && [key, val]
            end.compact.to_h.merge(
              type: col.type,
              default: col.default,
              nullable: col.null,
              sql: col.sql_type,
            )]
          end.to_h,
          relations: model.reflections.map do |rel_name, rel|
            [rel_name, {
              ref_class: model.name,
              class_name: rel.class_name,
              collection: rel.collection?,
              macro: rel.macro,
              options: rel.options,
              plural_name: rel.plural_name,
              type: rel.type,
            }]
          end.to_h
        }]
      rescue StandardError
        nil
      end
    end.compact.to_h
  end

  def run_client
    return if Rails.env.production?

    @meta_class = nil
    @id = 0
    @socket = nil
    @events = nil
    @enabled = false
    @subscribed_events = []
    @zero_buff = ' ' * CHUNK_SIZE
    @app_path = Rails.root.to_s + '/'
    check_connection
  end

  def subscribe_checker
    @subscribed_events.each { |e| unsubscribe e }
    @subscribed_events = []
    @events = nil
    @socket = nil
    @checker = subscribe('start_processing.action_controller', method(:check))
  end

  def subscribe_events
    @subscribed_events = WATCH_EVENTS.map do |event|
      subscribe(event, method(:process_event))
    end
  end

  WATCH_EVENTS = ([/\w+\.action_view/, /\w+\.active_record/] + %w[
    start_processing.action_controller
    process_action.action_controller
    inspect_exception.rails_log_viewer
  ]).freeze
  CHUNK_SIZE = 8 * 1024

  def send_data(s, data)
    raw = "#{data}#{@zero_buff[(data.size - CHUNK_SIZE)..-1]}"
    binding.pry if raw.size > CHUNK_SIZE
    s.send(raw, 0)
  end

  def connection_message
    return @connection_message if @connection_message

    options = Rails::Server.new.options
    @connection_message = {
      pid: Process.pid,
      api_prefix: @api_prefix,
      host: options[:Host],
      mode: Rails.env.to_s,
      path: Rails.root.to_s,
      port: options[:Port],
      ruby: RUBY_VERSION,
      started: @started,
      version: Rails.version,
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
    unsubscribe(@checker) if @checker
    @checker = nil
    send_data(socket, "#{[-1].pack 'I'}#{connection_message}")
    @socket = socket
    @events = {}
    subscribe_events
  rescue StandardError
    subscribe_checker unless @checker
  end

  def check(_event, _started, _finished, id, _data)
    check_connection
    @events[id] = { view: [], orm: [] } if @events
  end

  def send_log(id, data)
    unless @events
      subscribe_checker
      return
    end

    event = @events.delete(id)
    return unless event

    get_chunks(event.merge!(data)) do |chunk|
      send_data(@socket, chunk)
    end
  rescue StandardError
    check_connection
    send_log(id, data) if @events
  end

  CHUNK_LIMIT = CHUNK_SIZE - 32

  def get_chunks(data)
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
    raw.find_all do |path|
      path.include?(@app_path) && path.exclude?(__FILE__)
    end
    .map do |path|
      path[@app_path.size..-1]
    end
  end

  def process_event(event, started, finished, id, data)
    return unless @socket
    return if event[0] == '!'

    if event == 'start_processing.action_controller'
      rid = (started.to_f * 1000).to_i.to_s(36)
      @events[id] ||= { id: rid, started: started, view: [], orm: [] }
      return
    end

    payload = data.merge(
      event: event,
      finished: finished,
    )

    if event == 'process_action.action_controller'
      controller = payload[:controller].constantize.new
      source = begin
                 controller.method(payload[:action]).source_location
               rescue StandardError
                 nil
               end
      payload[:source] = source
      if payload[:exception]
        e = @events[id]
        e&.merge!(payload)
      else
        send_log(id, payload)
      end
      return
    end

    if event == 'inspect_exception.rails_log_viewer'
      send_log(id, payload)
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
end
