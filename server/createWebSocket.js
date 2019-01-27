const WebSocket = require('ws');

const noop = () => {};

const ping = (ws) => {
  if (!ws.isAlive) {
    ws.terminate();
    return;
  }

  ws.isAlive = false;
  ws.ping(noop);
};

function heartbeat() {
  this.isAlive = true;
}

function upgradeHandler(ctx) {
  const { request, socket } = ctx;
  this.handleUpgrade(request, socket, Buffer.alloc(0), (ws) => {
    this.emit('connection', ws, request);
  });
  ctx.respond = false;
  return null;
}

function onConnection(ws) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', (...args) => {
    this.onMessage(...args);
  });
}

const webSockets = [];

setInterval(() => {
  webSockets.forEach(ws => ws.clients.forEach(ping));
}, 15000);

module.exports = (options = {}) => {
  const ws = new WebSocket.Server({ noServer: true, ...options });
  ws.upgradeHandler = upgradeHandler.bind(ws);
  ws.onMessage = () => {};
  ws.on('connection', onConnection.bind(ws));

  webSockets.push(ws);
  return ws;
};
