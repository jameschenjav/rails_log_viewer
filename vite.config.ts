import { env } from 'process';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

const DEV_SERVER_HOST = env.DEV_SERVER_HOST || '0.0.0.0';
const DEV_SERVER_PORT = Number(env.DEV_SERVER_PORT || '3456') || 3456;

const API_SERVER_HOST = env.API_SERVER_HOST || '0.0.0.0';
const API_SERVER_PORT = Number(env.API_SERVER_HOST || '8765') || 8765;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    host: DEV_SERVER_HOST,
    port: DEV_SERVER_PORT,
    strictPort: true,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: `http://${API_SERVER_HOST}:${API_SERVER_PORT}`,
        ws: true,
      },
      '/test': `http://${API_SERVER_HOST}:${API_SERVER_PORT}`,
    },
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, './public'),
  },
});
