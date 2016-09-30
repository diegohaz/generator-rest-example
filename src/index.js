// It's the entry point file. We this in development and test mode because at this point the code
// isn't transpiled yet. So here we can't use ES6.
var env = process.env.NODE_ENV || 'development'

if (env === 'development' || env === 'test') {
  require('babel-core/register')
}

exports = module.exports = require('./app')
