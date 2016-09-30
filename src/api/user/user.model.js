// import some stuff that we will use to encrypt and authenticate
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
// import mongoose
import mongoose, { Schema } from 'mongoose'
// import a mongoose plugin
import mongooseKeywords from 'mongoose-keywords'
// import the environment mode
import { env } from '../../config'

// use bluebird to promisify the bcrypt.compare method
const compare = require('bluebird').promisify(bcrypt.compare)
// you can add more roles here
const roles = ['user', 'admin']

const userSchema = new Schema({
  // the id field is automatically added by mongoose
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  services: {
    facebook: String
  },
  role: {
    type: String,
    enum: roles,
    default: 'user'
  },
  picture: {
    type: String,
    trim: true
  }
}, {
  // it adds the `createdAt` and `updatedAt` fields to the schema
  timestamps: true
})

// when setting `email`
userSchema.path('email').set(function (email) {
  // automatically set the picture using the gravatar url
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex')
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`
  }

  // automatically set the name using the first part of the email
  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

// when user is saved
userSchema.pre('save', function (next) {
  // if password wasn't modified, just pass
  if (!this.isModified('password')) return next()

  /* istanbul ignore next */
  const rounds = env === 'test' ? 1 : 9

  // encrypt the password
  bcrypt.hash(this.password, rounds, (err, hash) => {
    /* istanbul ignore next */
    if (err) return next(err)
    this.password = hash
    next()
  })
})

userSchema.methods = {
  view (full) {
    let view = {}
    let fields = ['id', 'name', 'picture']

    if (full) {
      fields = [...fields, 'email', 'createdAt']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  },

  authenticate (password) {
    return compare(password, this.password).then((valid) => valid ? this : false)
  }
}

userSchema.statics = {
  // it's just a reference to the const roles above
  roles,

  // it can be used to create a user from facebook, google, twitter etc.
  createFromService ({ service, id, email, name, picture }) {
    return this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] }).then((user) => {
      if (user) {
        user.services[service] = id
        user.name = name
        user.picture = picture
        return user.save()
      } else {
        const password = randtoken.generate(16)
        return this.create({ services: { [service]: id }, email, password, name, picture })
      }
    })
  }
}

// it defines a `keywords` field combining `email` and `name`
userSchema.plugin(mongooseKeywords, { paths: ['email', 'name'] })

export default mongoose.model('User', userSchema)
