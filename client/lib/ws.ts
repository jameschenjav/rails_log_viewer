import { push } from './actionsSlice';
import { add, closed } from './connectionsSlice';
import { dispatch } from './store';

import { WsMessage } from './types';
import { toCamelCaseKeys } from './utils';

const WS_URL = `ws://${window.location.hostname}:${window.location.port}/api`;

export const initWebsocket = () => {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (ev) => {
    const { data } = ev;
    try {
      const msg = toCamelCaseKeys(JSON.parse(data)) as WsMessage;
      // console.debug(msg);
      switch (msg.type) {
        case 'init': {
          const { servers } = msg;
          dispatch(add(servers.map(({ pid, ...payload }) => ({
            rid: pid,
            connected: true,
            ...payload,
          }))));
          break;
        }
        case 'connected': {
          const { server } = msg;
          dispatch(add([server].map(({ pid, ...payload }) => ({
            rid: pid,
            connected: true,
            ...payload,
          }))));
          break;
        }
        case 'closed': {
          const { rid } = msg;
          dispatch(closed({ rid }));
          break;
        }
        case 'data': {
          const { rid, ts } = msg;
          const aid = `${rid}-${ts}`;
          dispatch(push({ aid, ...msg }));
          break;
        }
        default: {
          //
        }
      }
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
