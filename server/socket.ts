import { inflate as inflateSync } from 'zlib';
import { unlink as unlinkSync } from 'fs';
import { createServer, Server, Socket } from 'net';
import { promisify } from 'util';

import type { SocketStream } from '@fastify/websocket';

import { server } from './server';

const inflate = promisify(inflateSync);
const unlink = promisify(unlinkSync);

const SOCKET_NAME = '/tmp/rlv.sock';
const BLOCK_SIZE = 8 * 1024 - 32;

interface RailsMeta {
  api_prefix: string;
  host: string;
  mode: string;
  path: string;
  pid: string;
  port: number;
  rid: string;
  ruby: string;
  started: number;
  type: string;
  version: string;
}

class BufferItem {
  public async toMessage(): Promise<Record<string, unknown>> {
    return JSON.parse((await inflate(this.data)).toString());
  }

  public get isFull(): boolean { return this.total === this.count; }

  public constructor(size: number, total: number) {
    this.data = new Uint8Array(size);
    this.total = total;
  }

  public update(data: Buffer): void {
    const buffOffset = data.readUInt16LE(14);
    const buffLength = data.readUInt16LE(16);
    data.copy(this.data, buffOffset * BLOCK_SIZE, 18, 18 + buffLength);
    this.count += 1;
  }

  public readonly data: Uint8Array;

  public readonly total: number;

  private count = 0;
}

class BufferManager {
  public updateForEvent(eventId: number, data: Buffer): BufferItem {
    const buff = this.forEvent(eventId, data);
    buff.update(data);
    return buff;
  }

  public delete(eventId: number): void {
    this.buffers.delete(eventId);
  }

  protected forEvent(id: number, data: Buffer): BufferItem {
    const buff = this.buffers.get(id);
    if (buff) return buff;

    const r = new BufferItem(data.readUInt32LE(8), data.readUInt16LE(12));
    this.buffers.set(id, r);
    return r;
  }

  private buffers = new Map<number, BufferItem>();
}

const broadcast = (message: Record<string, unknown>): void => {
  const json = JSON.stringify(message);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [...wsData.connections.values()].forEach((conn) => {
    conn.socket.send(json);
  });
};

class RailsConnection {
  public get id(): string { return this.metaData ? this.metaData.pid : ''; }

  public get meta(): RailsMeta | null { return this.metaData; }

  public constructor(c: Socket, s: IpcSocketServer) {
    this.connection = c;
    this.server = s;
    this.buffManager = new BufferManager();

    c.on('data', this.onData.bind(this));
    c.on('error', (error) => server.log.error(error));
    c.on('end', this.onEnd.bind(this));
  }

  protected broadcast(message: Record<string, unknown>, type = 'data'): void {
    server.log.info('broadcast', this.id, type);
    broadcast({ rid: this.id, type, ...message });
  }

  protected async onData(data: Buffer): Promise<void> {
    try {
      const eventId = data.readUInt32LE(0);
      if (eventId === 0xFFFFFFFF) {
        const meta = JSON.parse(data.slice(4).toString());
        this.metaData = meta as RailsMeta;
        this.broadcast({ server: meta }, 'connected');
        return;
      }

      // eslint-disable-next-line no-bitwise
      switch (eventId & 0xFF) {
        case 1: {
          // sign[4], rawSize[4]
          const message = JSON.parse(data.slice(8, 8 + data.readUInt32LE(4)).toString());
          this.broadcast(message);
          return;
        }
        case 2: {
          // sign[4], rawSize[4], zipSize[4]
          const size = data.readUInt32LE(8);
          const raw = await inflate(data.slice(12, 12 + size));
          const message = JSON.parse(raw.toString());
          this.broadcast(message);
          return;
        }
        case 3: {
          // sign[4], rawSize[4], zipSize[4]
          // blockCount[2], blockIndex[2], blockSize[2]
          const buff = this.buffManager.updateForEvent(eventId, data);

          if (buff.isFull) {
            this.buffManager.delete(eventId);
            const message = await buff.toMessage();
            this.broadcast(message);
          }
          return;
        }
        default:
          server.log.warn(`unsupported id ${eventId.toString(16)}`, data, this.id);
      }
    } catch (e) {
      server.log.error('[DATA]', this.id, e);
    }
  }

  protected onEnd(): void {
    this.server.close(this.connection);
  }

  private connection: Socket;

  private server: IpcSocketServer;

  private buffManager: BufferManager;

  private metaData: RailsMeta | null = null;
}

class IpcSocketServer {
  public readonly server: Server;

  public static self: IpcSocketServer;

  public get railsConnections(): RailsConnection[] {
    return [...this.connections.values()];
  }

  public constructor() {
    IpcSocketServer.self = this;
    this.server = createServer(this.connect.bind(this));
  }

  public close(connection: Socket): void {
    server.log.info('rails closed');
    const r = this.connections.get(connection)!;
    this.connections.delete(connection);
    broadcast({ rid: r.id, type: 'closed' });
  }

  protected connect(connection: Socket): void {
    server.log.info('rails connected');
    this.connections.set(connection, new RailsConnection(connection, this));
  }

  private connections = new Map<Socket, RailsConnection>();
}

const wsData = {
  baseId: Date.now(),
  connections: new Map<string, SocketStream>(),
  ipcSocket: new IpcSocketServer(),
};

const genId = (): string => {
  wsData.baseId += 1;
  return wsData.baseId.toString(36);
};

export const wsConnectionHandler = (connection: SocketStream) => {
  const id = genId();

  wsData.connections.set(id, connection);

  connection.socket.on('ping', () => {
    connection.socket.send('pong');
  });

  connection.socket.on('close', () => {
    wsData.connections.delete(id);
  });

  const servers = wsData.ipcSocket.railsConnections.map((rs) => rs.meta);
  connection.socket.send(JSON.stringify({ type: 'init', servers }));
};

export const startHeartBeat = (): NodeJS.Timer => setInterval(() => {
  [...wsData.connections.values()].forEach((conn) => {
    conn.socket.send('ping');
  });
}, 15_000);

export const stopHeartBeat = (timer: NodeJS.Timer): void => {
  clearInterval(timer);
};

export const startIpc = async (): Promise<void> => {
  if (wsData.ipcSocket.server.listening) return;

  try {
    await unlink(SOCKET_NAME);
  } catch (e) {
    server.log.warn(e);
  }

  wsData.ipcSocket.server.listen(SOCKET_NAME);
};
