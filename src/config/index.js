/* eslint-disable no-unused-vars */
import path from 'path'
import _ from 'lodash'

// it throws an error if you forget to set the required environment variables
/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable')
  }
  return process.env[name]
}

// when not in production, it gets the environment variables from the .env file
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  const dotenv = require('dotenv-safe')
  dotenv.load({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example')
  })
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '../../'),
    // this way you can start the server like `PORT=3000 IP=127.0.0.1 npm run dev`
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    masterKey: requireProcessEnv('MASTER_KEY'),
    jwtSecret: requireProcessEnv('JWT_SECRET'),
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    mongo: {
      uri: 'mongodb://localhost/generator-rest-example-test',
      options: {
        debug: false
      }
    }
  },
  development: {
    mongo: {
      uri: 'mongodb://localhost/generator-rest-example-dev',
      options: {
        debug: true
      }
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/generator-rest-example'
    }
  }
}

export default _.merge(config.all, config[config.all.env])
