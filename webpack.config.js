const path = require('path');

module.exports = {
  entry: './client/static/js/app.js',
  output: {
    path: path.resolve(__dirname, 'client/static/js/'),
    filename: 'bundle.js',
  },
  optimization: {
    minimize: true
  },
  watch: true,
  // devtool: "source-map",
  mode: 'production'
};