# config.middleware.insert_before Rack::Lock, RailsLogViewer if Rails.const_defined? 'Server'
class RailsLogViewer
  DEFAULT_PREFIX = '/_rlv/meta/'

  def initialize(app, api_prefix: nil)
    @app = app
    @api_prefix = api_prefix.presence || DEFAULT_PREFIX
    @api_prefix += '/' unless @api_prefix.end_with? '/'
    run_client
  end

  def call(env)
    path = env['PATH_INFO']
    return @app.call(env) unless path.start_with? @api_prefix

    dispath(path[@api_prefix.size .. -1])
  end

  private

  def dispath(action)
    case action
    when 'models'
      [200, { "Content-Type" => "application/json" }, [get_all_models.to_json]]
    else
      [404, {}, []]
    end
  end

  def get_all_models
    model_names = Dir.entries(Rails.root.join('app/models'))
      .map { |fn| fn.end_with?('.rb') ? fn.sub('.rb', '').camelize : nil }
      .compact
    base_model_class = 'ApplicationRecord'.constantize rescue ActiveRecord::Base
    model_names.map do |name|
      begin
        model = name.constantize
        next if !(model < base_model_class) || model.abstract_class?

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
          relations: model.reflections.map do |name, rel|
            [name, {
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
      rescue Exception => e
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
    @zero_buff = ' ' * BLOCK_SIZE
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
  ]).freeze
  BLOCK_SIZE = 8 * 1024

  def send_data(s, data)
    raw = "#{data}#{@zero_buff[(data.size - BLOCK_SIZE) .. -1]}"
    binding.pry if raw.size > BLOCK_SIZE
    s.send(raw, 0)
  end

  def connection_message
    return @connection_message if @connection_message

    options = Rails::Server.new.options
    @connection_message = {
      pid: Process.pid,
      path: Rails.root.to_s,
      mode: Rails.env.to_s,
      host: options[:Host],
      port: options[:Port],
      ruby: RUBY_VERSION,
      version: Rails.version,
      api_prefix: @api_prefix,
    }.to_json.freeze
  end

  def subscribe(event, block)
    ActiveSupport::Notifications.subscribe(event, &block)
  end

  def unsubscribe(e)
    ActiveSupport::Notifications.unsubscribe(e) if e
  end

  def check_connection
    socket = UNIXSocket.new('/tmp/rlv.sock') rescue nil
    unsubscribe(@checker) if @checker
    @checker = nil
    send_data(socket, "#{[-1].pack 'I'}#{connection_message}")
    @socket = socket
    @events = {}
    subscribe_events
  rescue Exception => e
    subscribe_checker unless @checker
  end

  def check(event, started, finished, id, data)
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

    send_blocks(event.merge!(data)) do |block|
      send_data(@socket, block)
    end
  rescue Exception => e
    check_connection
    send_log(id, data) if @checker
  end

  BLOCK_LIMIT = BLOCK_SIZE - 32

  def send_blocks(data)
    json = data.to_json
    raw_size = json.size
    if raw_size <= BLOCK_LIMIT
      # 8
      yield "#{signature(1, raw_size)}#{json}"
      return
    end

    zipped = Zlib.deflate json
    zip_size = zipped.size
    return if zip_size >= 0x0100_0000 # 16M
    if zip_size <= BLOCK_LIMIT
      # 12
      yield "#{signature(2, raw_size, zip_size)}#{zipped}"
      return
    end

    block_count = ((0.0 + zip_size) / BLOCK_LIMIT).ceil
    # 4 + 4 + 4 + 2
    head = "#{signature(3, raw_size, zip_size)}#{[block_count].pack 'S'}"
    block_count.times do |index|
      block = zipped.slice(index * BLOCK_LIMIT, BLOCK_LIMIT)
      # 14 + 2 + 2
      yield "#{head}#{[index, block.size].pack 'S S'}#{block}"
    end
  end

  def signature(type, *uint32_list)
    @id = (@id + 1) & 0x007F_FFFF
    [type | (@id << 8), *uint32_list].pack 'L*'
  end

  def process_event(event, started, finished, id, data)
    return unless @socket
    return if event[0] == '!'

    if event == 'start_processing.action_controller'
      @events[id] = { view: [], orm: [] }
      return
    end

    data.merge!(started: started, finished: finished)

    if event == 'process_action.action_controller'
      send_log(id, data)
      return
    end

    e = @events[id]
    return unless e

    stack = caller.find_all { |s| s.include?(@app_path) && s.exclude?(__FILE__) }
    extra = { stack: stack, event: event }
    if event =~ /\w+\.action_view/
      extra = { stack: stack, event: event }
      e[:view] << data.merge!(extra)
    else
      if event.start_with? 'sql.'
        e[:orm] << data.merge!(extra)
                        .merge!(binds: data[:binds].map { |b| [b[0].name, b[1]] })
      else
        e[:orm] << data.merge!(extra)
      end
    end
  end
end
