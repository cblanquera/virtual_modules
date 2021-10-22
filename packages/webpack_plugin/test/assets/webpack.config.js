const VMWebpackPlugin = require('../../dist/WebpackPlugin').default

module.exports = {
  resolve: {
    extensions: [ '.js' ],
    plugins: [ new VMWebpackPlugin ]
  },
  entry: `${__dirname}/entry.js`,
  output: {
    path: `${__dirname}/build`, 
    filename: '[name].js', 
  },
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: { chunks: 'all' },
    minimize: false
  }
}