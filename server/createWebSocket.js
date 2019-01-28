const WebSocket = require('ws');

const noop = () => {};

const ping = (ws) => {
  if (!ws.isAlive) {
    console.log('ws stopped', ws.id);
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

const webSockets = [];

setInterval(() => {
  webSockets.forEach(ws => ws.clients.forEach(ping));
}, 15000);

module.exports = ({ onConnection, ...options } = {}) => {
  const ws = new WebSocket.Server({ noServer: true, ...options });
  ws.upgradeHandler = upgradeHandler.bind(ws);
  ws.onMessage = noop;
  ws.on('connection', (con) => {
    const id = Date.now().toString(36);
    con.isAlive = true;
    con.connectionId = id;

    console.log('ws connected', id);
    if (onConnection) {
      onConnection.call(ws, con);
    }

    con.on('pong', heartbeat);
    con.on('message', (...args) => {
      ws.onMessage(id, ...args);
    });
  });

  webSockets.push(ws);
  return ws;
};
