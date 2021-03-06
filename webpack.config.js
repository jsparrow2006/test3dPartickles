const webpack = require('webpack');
const path = require('path');
const { version } = require('./package.json');

const outputDir = path.resolve(__dirname, 'dist');

process.noDeprecation = true;

const config = {
  mode: 'production',
  entry: {
    Particles3D: './src/index.js',
  },
  output: {
    path: outputDir,
    filename: 'index.js',
    library: 'particles3d',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')]
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'babel-loader',
        exclude: /(node_modules)/,
      },
    ],
  },

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        VERSION: JSON.stringify(version),
      },
    }),
  ],
  stats: {
    assetsSort: '!size',
    modules: false,
    timings: false,
    builtAt: false,
    entrypoints: false,
    hash: false,
    version: false,
    warningsFilter: [
      'webpack performance recommendations',
      'asset size limit',
      'entrypoint size limit',
    ],
  },
};

module.exports = config;
