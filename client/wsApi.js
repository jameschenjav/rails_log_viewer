const IS_DEV = process.env.NODE_ENV === 'development';
const PORT = IS_DEV ? 8030 : window.location.port;
const WS_URL = `ws://${window.location.hostname}:${PORT}/api`;

const wsApi = {
  ws: new WebSocket(WS_URL),
  handlers: {},
};

const logHandlers = {};

const logInfo = (type) => {
  const fn = logHandlers[type];
  if (fn) return fn;

  const log = (...args) => console.info(type, ...args);
  logHandlers[type] = log;
  return log;
};

wsApi.ws.onmessage = ({ data }) => {
  const { type, ...payload } = JSON.parse(data);
  try {
    const handler = wsApi.handlers[type];
    (handler || logInfo(type))(payload);
  } catch (e) {
    console.error(e, { data });
  }
};

export default wsApi;
