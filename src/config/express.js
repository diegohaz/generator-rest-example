import express from 'express'
import forceSSL from 'express-force-ssl'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { errorHandler as queryErrorHandler } from 'querymen'
import { errorHandler as bodyErrorHandler } from 'bodymen'
import { env } from './'

export default (routes) => {
  const app = express()

  // force SSL (https) when in production mode
  /* istanbul ignore next */
  if (env === 'production') {
    app.set('forceSSLOptions', {
      enable301Redirects: false,
      trustXFPHeader: true
    })
    app.use(forceSSL)
  }

  // enable CORS, compression and a nice request logger when in production or development mode
  /* istanbul ignore next */
  if (env === 'production' || env === 'development') {
    app.use(cors())
    app.use(compression())
    app.use(morgan('dev'))
  }

  // parse request body
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  // apply our routes
  // you can change this to app.use('/api', routes) for example
  app.use(routes)
  // apply querymen and bodymen error handlers, which give us standard json error responses (see
  // https://github.com/diegohaz/querymen and https://github.com/diegohaz/bodymen)
  app.use(queryErrorHandler())
  app.use(bodyErrorHandler())

  return app
}
