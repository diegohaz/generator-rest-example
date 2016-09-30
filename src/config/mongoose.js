import Promise from 'bluebird'
import mongoose from 'mongoose'
import { mongo } from '.'

// set the mongo options
Object.keys(mongo.options).forEach((key) => {
  mongoose.set(key, mongo.options[key])
})

mongoose.Promise = Promise

// it creates a view method for those fields which aren't populated
/* istanbul ignore next */
mongoose.Types.ObjectId.prototype.view = function () {
  return { id: this.toString() }
}

/* istanbul ignore next */
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err)
  process.exit(-1)
})

export default mongoose
