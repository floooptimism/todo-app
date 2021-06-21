const path = require('path');

module.exports = {
  entry: './client/static/js/app.js',
  output: {
    path: path.resolve(__dirname, 'client/static/js/'),
    filename: 'bundle.js',
  },
  optimization: {
    minimize: false
  },
  watch: true,
  // devtool: "source-map",
  mode: 'production'
};