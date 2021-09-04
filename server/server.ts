import fastify from 'fastify';
import { env } from 'process';
import { resolve } from 'path';

export const server = fastify({
  logger: {
    level: 'info',
  },
});

export const host = env.RLV_HOST || '0.0.0.0';

export const port = Number(env.RLV_PORT || '8765') || 8765;

export const dist = resolve(__dirname, '../dist');
