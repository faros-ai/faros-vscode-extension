const path = require('path');

const extConfig = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'out'),
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: { rules: [{ test: /\.ts$/, loader: 'ts-loader' }] },
  externals: { vscode: 'vscode' },
};

const webviewConfig = {
  target: 'web',
  entry: './src/webview/index.tsx',
  output: {
    filename: '[name].wv.js',
    path: path.resolve(__dirname, 'out'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ['babel-loader', 'ts-loader'] },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

module.exports = [webviewConfig, extConfig];