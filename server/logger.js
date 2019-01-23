const fs = require('fs');
const { promisify } = require('util');
const { StringDecoder } = require('string_decoder');
const chokidar = require('chokidar');

const createWebSocket = require('./createWebSocket');
const { findRubyServerPid, findRailsLogPath } = require('./utils');

const { existsSync, close } = fs;
const fstatAsync = promisify(fs.fstat);
const openAsync = promisify(fs.open);
const readAsync = promisify(fs.read);

const BUFFER_SIZE = 16 * 1024;

const watcher = chokidar.watch([], {
  disableGlobbing: true,
  usePolling: true,
  awaitWriteFinish: {
    stabilityThreshold: 200,
  },
  atomic: true,
});

const logger = {
  position: null,
  lines: null,
  last: null,
};

const wsLog = createWebSocket();
const buffer = new Uint8Array(BUFFER_SIZE);
const utf8Decoder = new StringDecoder('utf8');
const env = {
  mode: 'development',
  port: 3000,
};

let railsPid = null;
let logFilename = null;

async function readNext() {
  const { fd, position } = logger;
  const { bytesRead } = await readAsync(fd, buffer, 0, BUFFER_SIZE, position);
  logger.position += bytesRead;
  if (bytesRead === BUFFER_SIZE) {
    logger.last = `${logger.last}${utf8Decoder.write(buffer.subarray(0, bytesRead))}`;
    return readNext();
  }

  const text = `${logger.last}${utf8Decoder.end(buffer.subarray(0, bytesRead))}`;
  const lastNewline = text.lastIndexOf('\n');
  if (lastNewline) {
    logger.last = text.slice(lastNewline + 1);
    return text.slice(0, lastNewline);
  }
  logger.last = text;
  return null;
}

const ESC = '\u001b';
const STR_RE_COLOR_CTL = `${ESC}\\[\\d*m`;
const RE_COLOR_CTL_G = new RegExp(STR_RE_COLOR_CTL, 'g');

function parseLines() {
  const { lines } = logger;
  logger.lines = [];
  return { lines };
}

watcher.on('change', async (paths, stats) => {
  console.log('updated', new Date().toISOString());
  const { position, lines, fd } = logger;
  if (!(lines && fd && (position || position === 0))) return;
  if (stats.size < position) {
    Object.assign(logger, {
      position: stats.size,
      lines: [],
      last: '',
    });
    return;
  }

  const text = await readNext();
  if (!text) return;

  logger.lines = [...lines, ...text.trim().replace(RE_COLOR_CTL_G, '').split('\n')];
  const data = parseLines();
  const message = JSON.stringify({ type: 'LOG', data });
  wsLog.clients.forEach((ws) => {
    ws.send(message);
  });
  console.log(`sent ${message.length}`);
});

function unwatch() {
  const { fd } = logger;

  if (fd) {
    close(fd, console.error);
  }

  Object.assign(logger, {
    fd: null,
    position: null,
    lines: null,
    last: null,
  });
  watcher.unwatch('*');
}

async function watchLog() {
  if (!logFilename || !existsSync(logFilename)) {
    unwatch();
    console.log('unwatch');
    return;
  }

  const fd = await openAsync(logFilename, 'r');
  const { size } = await fstatAsync(fd);

  unwatch();
  Object.assign(logger, {
    fd,
    position: size,
    lines: [],
    last: '',
  });

  watcher.add(logFilename);
}

setInterval(async () => {
  const pid = await findRubyServerPid(env);
  if (railsPid !== pid) {
    railsPid = pid;
    if (!pid) {
      logFilename = null;
      watchLog();
      return;
    }

    const logFile = await findRailsLogPath({ pid, ...env });
    console.log('watch', { pid, logFile });
    if (logFile !== logFilename) {
      logFilename = logFile;
      watchLog();
    }
  }
}, 3000);

module.exports = {
  connect: wsLog.upgradeHandler,
  setup: ({ mode, port }) => {
    if (mode) env.mode = mode;
    if (port) env.port = port;
  },
};
