const path = require('path');
const process = require('process');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const plugins = [];
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(js|css)$'),
      // minimum 5K
      threshold: 1024 * 5,
      // minRatio: 0.6,
    }),
  );
}

module.exports = {
  productionSourceMap: process.env.NODE_ENV !== 'production',
  devServer: {
    host: '0.0.0.0',
    port: 8000,
    proxy: {
      '/log': {
        target: 'http://127.0.0.1:3333',
        ws: true,
      },
    },
    allowedHosts: [
      '.localhost',
      '.insoftint.com',
      '.javln.com',
    ],
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins,
  },
};
