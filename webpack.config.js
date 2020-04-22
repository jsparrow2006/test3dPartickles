const path = require('path');
const webpack = require('webpack');

const PATHS = {
    source: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build')
};
 
module.exports = {
    entry: PATHS.source + '/index.js',
    output: {
        path: PATHS.build,
        filename: '[name].js',
        library: '3dparticles',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
          ]
      },
    
};