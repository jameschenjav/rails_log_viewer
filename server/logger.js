const createWebSocket = require('./createWebSocket');
const { startServer, subscribe, getConnectedRails } = require('./logSocket');

const wsLog = createWebSocket({
  perMessageDeflate: true,
  onConnection: (con) => {
    const message = {
      type: 'init',
      servers: getConnectedRails(),
    };
    con.send(JSON.stringify(message));
  },
});

startServer();

subscribe((type, data) => {
  wsLog.clients.forEach(ws => ws.send(JSON.stringify({ type, ...data })));
});

wsLog.onMessage = console.log;

module.exports = wsLog.upgradeHandler;
