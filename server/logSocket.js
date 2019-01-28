const zlib = require('zlib');
const fs = require('fs');
const { createServer } = require('net');
const { promisify } = require('util');

const inflate = promisify(zlib.inflate);
const unlink = promisify(fs.unlink);

const SOCKET_NAME = '/tmp/rlv.sock';
const BLOCK_SIZE = 8 * 1024 - 32;
const receivers = [];

const dispatch = ({ type = 'data', ...args }) => {
  receivers.forEach(fn => fn(type, args));
};

const connectedRails = {};

const server = createServer((socket) => {
  const now = Date.now();
  const buffers = {};
  const established = now.toString(36).slice(2);

  console.log('connection established', established, (new Date(now)).toISOString());
  socket
    .on('data', async (data) => {
      try {
        const eventId = data.readUInt32LE(0);
        if (eventId === 0xFFFFFFFF) {
          const meta = JSON.parse(data.slice(4).toString());
          buffers.rid = meta.pid;
          connectedRails[meta.pid] = meta;
          dispatch({ type: 'connected', meta });
          console.log('connected', (new Date()).toISOString(), meta);
          return;
        }

        const { rid } = buffers;
        switch (eventId & 0xFF) {
          case 1: {
            // sign[4], rawSize[4]
            const message = JSON.parse(data.slice(8, 8 + data.readUInt32LE(4)).toString());
            dispatch({ ...message, rid });
            return;
          }
          case 2: {
            // sign[4], rawSize[4], zipSize[4]
            const size = data.readUInt32LE(8);
            const raw = await inflate(data.slice(12, 12 + size));
            const message = JSON.parse(raw.toString());
            dispatch({ ...message, rid });
            return;
          }
          case 3: {
            // sign[4], rawSize[4], zipSize[4]
            // blockCount[2], blockIndex[2], blockSize[2]
            const buff = buffers[eventId] || {};
            if (!buff.data) {
              Object.assign(buff, {
                data: new Uint8Array(data.readUInt32LE(8)),
                total: data.readUInt16LE(12),
                count: 0,
              });
              buffers[eventId] = buff;
            }

            const buffOffset = data.readUInt16LE(14);
            const buffLength = data.readUInt16LE(16);
            data.copy(buff.data, buffOffset * BLOCK_SIZE, 18, 18 + buffLength);
            buff.count += 1;
            if (buff.count === buff.total) {
              delete buffers[eventId];
              const message = JSON.parse((await inflate(buff.data)).toString());
              dispatch({ ...message, rid });
            }
            return;
          }
          default:
            console.warn(`unsupported id ${eventId.toString(16)}`, data, rid);
        }
      } catch (e) {
        console.error('[DATA]', buffers.rid, e);
      }
    })
    .on('error', (error) => {
      console.error('[ERROR]', buffers.rid, error);
    })
    .on('end', () => {
      const { rid } = buffers;
      delete connectedRails[rid];
      dispatch({ type: 'end', rid });
      console.log('disconnected', rid);
    });
});

exports.getConnectedRails = () => Object.values(connectedRails);

exports.startServer = async () => {
  if (server.listening) return;

  try {
    await unlink(SOCKET_NAME);
  } catch (e) {
    console.warn(e);
  }

  server.listen(SOCKET_NAME);
};

exports.subscribe = fn => receivers.push(fn);
