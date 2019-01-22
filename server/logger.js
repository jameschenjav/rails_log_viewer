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

const wsLog = createWebSocket();
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
const BUFFER_SIZE = 16 * 1024;
const buffer = new Uint8Array(BUFFER_SIZE);
const utf8Decoder = new StringDecoder('utf8');
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

  logger.last = `${logger.last}${utf8Decoder.end(buffer.subarray(0, bytesRead))}`;
  return null;
}

function parseLines() {
  const { lines } = logger;
  logger.lines = [];
  return { lines };
}

watcher.on('change', async (...args) => {
  console.log('onLogChanged', args);
  const { position, lines, fd } = logger;
  if (!(position && lines && fd)) return;

  await readNext();
  const tempLines = logger.last.split('\n');
  const lineCount = tempLines.length;

  logger.lines = [...lines, tempLines.slice(0, lineCount - 2)];
  logger.last = tempLines[lineCount - 1];

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
  const pid = await findRubyServerPid();
  if (railsPid !== pid) {
    railsPid = pid;
    if (!pid) {
      logFilename = null;
      watchLog();
      return;
    }

    const logFile = await findRailsLogPath({ pid });
    console.log('watch', { pid, logFile });
    if (logFile !== logFilename) {
      logFilename = logFile;
      watchLog();
    }
  }
}, 3000);

module.exports = wsLog.upgradeHandler;
