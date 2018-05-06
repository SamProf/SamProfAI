const path = require('path');

module.exports = {
  entry: './worker.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, '../assets/')
  }
};
