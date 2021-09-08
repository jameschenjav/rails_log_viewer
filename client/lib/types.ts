export interface PayloadBase {
  rid: string,
}

export interface PayloadServer {
  apiPrefix: string,
  host: string,
  mode: string,
  path: string,
  pid: string,
  port: number,
  ruby: string,
  started: string,
  version: string,
}

export interface MessageInit {
  type: 'init',
  servers: PayloadServer[],
}

export interface MessageConnected extends PayloadBase {
  type: 'connected',
  server: PayloadServer,
}

export interface MessageClosed extends PayloadBase {
  type: 'closed',
}

interface EventBase {
  event: string,
  finished: string,
  stack: string[],
  started: string,
}

interface DataOrmSql extends EventBase {
  event: 'sql.active_record',
  binds: [string, string | number | boolean | null][],
  connectionId: number,
  name: string,
  sql: string,
  statementName: string | null,
}

interface DataOrmAr extends EventBase {
  event: 'instantiation.active_record',
  className: string,
  recordCount: number,
}

interface DataView extends EventBase {
  event: 'render_partial.action_view' | 'render_collection.action_view' | 'render_template.action_view',
  identifier: string,
}

type DataOrm = DataOrmSql | DataOrmAr;

interface PayloadData {
  action: string,
  controller: string,
  dbRuntime: number,
  event: string,
  finished: string,
  format: string,
  method: string,
  orm: DataOrm[],
  params: { controller: string, action: string },
  path: string,
  source: [string, number],
  started: string,
  status: number,
  ts: string,
  view: DataView[],
  viewRuntime: number,
}

export interface ActionData extends PayloadData { aid: string }

export interface MessageData extends PayloadBase, PayloadData {
  type: 'data',
}

export type WsMessage = MessageInit | MessageConnected | MessageClosed | MessageData;

export interface RailsConnection {
  rid: string,
  apiPrefix: string,
  host: string,
  mode: string,
  path: string,
  port: number,
  ruby: string,
  started: string,
  version: string,
  connected: boolean,
}
