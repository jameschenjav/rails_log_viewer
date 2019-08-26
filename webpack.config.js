const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sveltePreprocess = require('svelte-preprocess');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  entry: {
    bundle: './client/index.js',
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  output: {
    path: `${__dirname}/public`,
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: !prod,
            sourceMap: !prod,
          },
        },
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'svelte-loader',
            options: {
              emitCss: true,
              hotReload: false,
              preprocess: sveltePreprocess({}),
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          /**
           * MiniCssExtractPlugin doesn't support HMR.
           * For developing, use 'style-loader' instead.
           * */
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          { loader: 'css-loader', options: { sourceMap: !prod } },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        loader: 'file-loader',
        options: {
          name: '[name]-[contenthash].[ext]',
          outputPath: 'assets',
        },
      },
    ],
  },
  mode,
  plugins: prod
    ? [
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new BundleAnalyzerPlugin({
        reportFilename: path.resolve(__dirname, 'tmp/bundle-analyzer-report.html'),
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
    ]
    : [],
  devServer: {
    host: '0.0.0.0',
    contentBase: 'public',
    headers: { 'Access-Control-Allow-Origin': '*' },
    hot: true,
  },
  devtool: prod ? false : 'inline-source-map',
};
