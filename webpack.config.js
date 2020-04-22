// const path = require('path');
// const webpack = require('webpack');

// const PATHS = {
//     source: path.join(__dirname, 'src'),
//     build: path.join(__dirname, 'build')
// };
 
// module.exports = {
//     entry: PATHS.source + '/index.js',
//     output: {
//         path: PATHS.build,
//         filename: '[name].js',
//         library: '3dparticles',
//         libraryTarget: 'umd',
//     },
//     module: {
//         rules: [
//             {
//               test: /\.m?js$/,
//               exclude: /(node_modules|bower_components)/,
//               use: {
//                 loader: 'babel-loader',
//                 options: {
//                   presets: ['@babel/preset-env']
//                 }
//               }
//             }
//           ]
//       },
    
// };

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
    filename: '[name].bundle.js',
    library: 'particles3d',
    libraryTarget: 'umd',
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
