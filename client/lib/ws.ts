const WS_URL = `ws://${window.location.hostname}:${window.location.port}/api`;

export const initWebsocket = () => {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (ev) => {
    const { data } = ev;
    try {
      const { type, ...payload } = JSON.parse(data) as Record<string, unknown>;
      console.debug({ type, payload });
    } catch (e) {
      console.error(e, { data });
    }
  };

  ws.onclose = () => {
    console.debug('onclose');
  };

  ws.onerror = () => {
    console.debug('onerror');
  };
};

export default initWebsocket;
