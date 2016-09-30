import http from 'http'
// import our general config
import { env, mongo, port, ip } from './config'
// import our mongoose config
import mongoose from './config/mongoose'
// import our express config
import express from './config/express'
// import our API routes
import routes from './routes'

// start a new server with our API routes
const app = express(routes)
const server = http.createServer(app)

// connect to MongoDB
mongoose.connect(mongo.uri)

// start the server
setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
