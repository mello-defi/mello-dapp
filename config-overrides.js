const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url')
  });
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ]);
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.alias,
      _redux: path.resolve(__dirname, './src/_redux'),
      _services: path.resolve(__dirname, './src/_services'),
      _pages: path.resolve(__dirname, './src/_pages'),
      _components: path.resolve(__dirname, './src/_components'),
      _layouts: path.resolve(__dirname, './src/_layouts'),
      _interfaces: path.resolve(__dirname, './src/_interface'),
      _enums: path.resolve(__dirname, './src/_enums'),
      _assets: path.resolve(__dirname, './src/_assets'),
      _hooks: path.resolve(__dirname, './src/_hooks'),
      _utils: path.resolve(__dirname, './src/_utils'),
      _abis: path.resolve(__dirname, './src/_abis'),
      _constants: path.resolve(__dirname, './src/_constants')
    }
  };
  return config;
};
