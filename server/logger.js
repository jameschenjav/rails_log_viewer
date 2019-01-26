const createWebSocket = require('./createWebSocket');
const { startServer, subscribe } = require('./logSocket');

const wsLog = createWebSocket();
startServer();

subscribe((type, data) => {
  wsLog.clients.forEach(ws => ws.send(JSON.stringify({ type, ...data })));
});

module.exports = wsLog.upgradeHandler;
