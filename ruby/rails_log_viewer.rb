module RailsLogViewer
  def self.run
    @instance ||= Client.new
  end

  private

  class Client
    def initialize
      @id = 0
      @socket = nil
      @events = nil
      @enabled = false
      @subscribed_events = []
      @zero_buff = ' ' * BLOCK_SIZE
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
      @subscribed_events = %w[
        start_processing.action_controller
        process_action.action_controller
        render_template.action_view
        render_partial.action_view
        render_collection.action_view
        sql.active_record
      ].map do |event|
        subscribe(event, method(:process_event))
      end
    end

    private

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
      nil
    end

    def check(event, started, finished, id, data)
      check_connection
      @events[id] = { view: [], sql: [] } if @events
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
      binding.pry
      subscribe_checker
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

      if event == 'start_processing.action_controller'
        @events[id] = { view: [], sql: [] }
        return
      end

      data.merge!(started: started, finished: finished)

      if event == 'process_action.action_controller'
        send_log(id, data)
        return
      end

      e = @events[id]
      return unless e
      if event == 'sql.active_record'
        e[:sql] << data.merge(binds: data[:binds].map { |kv| [kv[0].name, kv[1]] })
      else
        # when 'render_template.action_view'
        # when 'render_partial.action_view'
        # when 'render_collection.action_view'
        e[:view] << data.merge!(action: event[7...-12])
      end
    end
  end
end
