const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: false,
    port: 9000,
  },
  ignoreWarnings: [
      {
          module: /treeviz/
      }
  ],
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  // loaders
  module: {
      rules: [
          {
              test: /\.tsx?/,
              use: 'ts-loader',
              exclude: /node_modules/,
          }
      ]
  }

};