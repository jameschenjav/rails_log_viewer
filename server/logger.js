const createWebSocket = require('./createWebSocket');

const wsLog = createWebSocket();

module.exports = wsLog.upgradeHandler;
