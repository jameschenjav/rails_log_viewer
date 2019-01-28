export default ({ url, store }) => {
  const ws = new WebSocket(url);

  ws.onmessage = ({ data }) => {
    const { type, ...payload } = JSON.parse(data);
    switch (type) {
      case 'init': {
        const servers = payload.servers.reduce((ss, server) => ({
          ...ss,
          [server.pid]: server,
        }), {});
        store.dispatch('updateState', { servers });
        break;
      }
      case 'connected': {
        const { meta: server } = payload;
        store.dispatch('commitUpdate', { name: 'addServer', server });
        break;
      }
      case 'end': {
        store.dispatch('commitUpdate', { name: 'deleteServer', ...payload });
        break;
      }
      case 'data': {
        store.dispatch('commitUpdate', { name: 'addLogSync', ...payload });
        // const { rid, ...log } = payload;
        // store.dispatch('addLog', { rid, log });
        break;
      }
      default:
        console.log('unsupported message', { type, payload });
    }
  };
};
