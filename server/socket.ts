import zlib from 'zlib';
import fs from 'fs';
import { createServer, Server, Socket } from 'net';
import { promisify } from 'util';
import consola from 'consola';

import { WebSocketServer, ConnectionHandler } from './wss';

const inflate = promisify(zlib.inflate);
const unlink = promisify(fs.unlink);

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
  started: string;
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

class RailsConnection {
  public get id(): string { return this.metaData ? this.metaData.pid : ''; }

  public get meta(): RailsMeta { return this.metaData; }

  public constructor(c: Socket, s: IpcSocketServer) {
    this.connection = c;
    this.server = s;
    this.buffManager = new BufferManager();

    c.on('data', this.onData.bind(this));
    c.on('error', (error) => consola.error(error));
    c.on('end', this.onEnd.bind(this));
  }

  protected broadcast(message: Record<string, unknown>, type = 'data'): void {
    consola.info('broadcast', this.id, type);
    this.server.broadcast(this, { type, ...message });
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
          consola.warn(`unsupported id ${eventId.toString(16)}`, data, this.id);
      }
    } catch (e) {
      consola.error('[DATA]', this.id, e);
    }
  }

  protected onEnd(): void {
    this.server.close(this.connection);
  }

  private connection: Socket;

  private server: IpcSocketServer;

  private buffManager: BufferManager;

  private metaData: RailsMeta;
}

const connectionHandler: ConnectionHandler = (context) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { self } = IpcSocketServer;
  const servers = self.railsConnections.map((rs) => rs.meta);
  context.connection.sendMessage({ type: 'init', servers });
};

class IpcSocketServer {
  public readonly server: Server;

  public readonly wss = new WebSocketServer({ connectionHandler });

  public static self: IpcSocketServer;

  public get railsConnections(): RailsConnection[] {
    return [...this.connections.values()];
  }

  public constructor() {
    IpcSocketServer.self = this;
    this.server = createServer(this.connect.bind(this));
  }

  public close(connection: Socket): void {
    consola.log('rails closed');
    const r = this.connections.get(connection);
    this.connections.delete(connection);
    this.broadcast(r, { type: 'closed' });
  }

  public broadcast(r: RailsConnection, message: Record<string, unknown>): void {
    this.wss.broadcast({ rid: r.id, ...message });
  }

  protected connect(connection: Socket): void {
    consola.log('rails connected');
    this.connections.set(connection, new RailsConnection(connection, this));
  }

  private connections = new Map<Socket, RailsConnection>();
}

const ss = new IpcSocketServer();

export const wsServer = ss.wss;

export const startIpc = async (): Promise<void> => {
  if (ss.server.listening) return;

  try {
    await unlink(SOCKET_NAME);
  } catch (e) {
    consola.warn(e);
  }

  ss.server.listen(SOCKET_NAME);
};
