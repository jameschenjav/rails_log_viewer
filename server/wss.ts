import WebSocket from 'ws';
import Koa from 'koa';
import consola from 'consola';

import { isDev } from './env';

const noop = (): void => {};

export class TimestampId {
  public readonly id: string;

  protected constructor() {
    this.id = Date.now().toString(36);
  }
}

type AnyMessage = Record<string, unknown>;

export class WebSocketConnection extends TimestampId {
  public readonly connection: WebSocket;

  public get isTerminated(): boolean { return this.terminated; }

  public ping(): void {
    if (!this.alive) {
      this.disconnect();
      return;
    }

    this.alive = false;
    this.connection.ping(noop);
  }

  public send(s: string): void { this.connection.send(s); }

  public sendMessage(message: AnyMessage): void {
    this.connection.send(JSON.stringify(message));
  }

  public disconnect(): void {
    if (this.terminated) return;

    consola.log('disconnected', this.id);
    this.terminated = true;
    this.connection.terminate();
  }

  public constructor(connection: WebSocket) {
    super();
    this.connection = connection;
    connection.on('pong', this.pong.bind(this));
    connection.on('error', (error) => {
      consola.error(this.id, error);
      // this.disconnect();
    });
    consola.log('connected', this.id);
  }

  private pong(): void {
    this.alive = true;
  }

  private alive = true;

  private terminated = false;
}

export interface WebSocketContext {
  connection: WebSocketConnection;
  server: WebSocketServer;
}

export type ConnectionHandler = (context: WebSocketContext, params?: Record<string, string>)
=> void;
export type MessageHandler = (context: WebSocketContext, message: AnyMessage) => void;
export type ErrorHandler = (context: WebSocketContext, error: Error) => void;

const defaultOnConnection: ConnectionHandler = ({ connection: { id: cId } }, params) => consola.info(`[${params ? 'connected' : 'disconnected'}] ${cId}`, params);

const defaultOnMessage: MessageHandler = (ctx, message) => {
  const { connection: { id: cId }, server: { id: sId } } = ctx;
  consola.info(`[message] ${sId}.${cId}`, message);
  ctx.connection.sendMessage({ id: message.id, result: message });
};

const defaultErrorHandler: ErrorHandler = ({ connection: { id: cId } }, error) => consola.error(`[error] ${cId}`, error);

const PING_INTERVAL = isDev ? 300_000 : 30_000;

interface ServerHandlers {
  connectionHandler?: ConnectionHandler;
  messageHandler?: MessageHandler;
  errorHandler?: ErrorHandler;
}

export class WebSocketServer extends TimestampId {
  public connectionHandler: ConnectionHandler;

  public messageHandler: MessageHandler;

  public errorHandler: ErrorHandler;

  public readonly server: WebSocket.Server;

  public get isTerminated(): boolean { return this.terminated; }

  public stop(): void {
    if (this.terminated) return;

    this.terminated = true;
    clearInterval(this.timer);
    this.connections.forEach((conn) => {
      conn.disconnect();
    });
    this.connections.clear();
    this.server.close();
  }

  public broadcast(message: Record<string, unknown>): void {
    const msg = JSON.stringify(message);
    [...this.connections.values()].forEach((conn) => {
      conn.send(msg);
    });
  }

  public entryPoint(ctx: Koa.ParameterizedContext): void {
    const { request, socket } = ctx;

    this.server.handleUpgrade(request.req, socket, Buffer.alloc(0), (connection) => {
      const conn = new WebSocketConnection(connection);
      const context = { connection: conn, server: this };

      connection.on('message', (data) => {
        try {
          const str = data.toString();
          if (!str.trim().length) return;

          const msg = Object.freeze(JSON.parse(str)) as AnyMessage;
          this.messageHandler(context, msg);
        } catch (error) {
          this.errorHandler(context, error);
        }
      });

      connection.on('close', (code, reason) => {
        consola.log('closed', this.id, { code, reason });
        this.connectionHandler(context);
        conn.disconnect();
      });

      this.connections.set(conn.id, conn);
      this.connectionHandler(context, ctx.params);
    });
    ctx.respond = false;
    return null;
  }

  public findConnection(id: string): WebSocketConnection {
    return this.connections.get(id);
  }

  public constructor(handlers: ServerHandlers = {}) {
    super();
    this.server = new WebSocket.Server({
      noServer: true,
      perMessageDeflate: true,
    });

    this.messageHandler = handlers.messageHandler || defaultOnMessage;
    this.connectionHandler = handlers.connectionHandler || defaultOnConnection;
    this.errorHandler = handlers.errorHandler || defaultErrorHandler;

    this.timer = setInterval(this.heartbeat.bind(this), PING_INTERVAL);
    this.entryPoint = this.entryPoint.bind(this);
  }

  private heartbeat(): void {
    const connections = [...this.connections.values()];
    const terminated = connections.filter((conn) => {
      const r = conn.isTerminated;
      if (!r) {
        conn.ping();
      }
      return r;
    });

    terminated.forEach(({ id }) => {
      this.connections.delete(id);
    });
  }

  private timer: NodeJS.Timeout;

  private connections = new Map<string, WebSocketConnection>();

  private terminated = false;
}
