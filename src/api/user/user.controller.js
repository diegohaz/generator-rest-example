import _ from 'lodash'
// import the response helpers
import { success, notFound } from '../../services/response/'
// import our model
import { User } from '.'

// It's an express middleware. It receives `querymen` from the querymen middleware (see
// https://github.com/diegohaz/querymen)
export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  User.find(query, select, cursor)
    // call user.view for each user
    .then((users) => users.map((user) => user.view()))
    .then(success(res))
    .catch(next)

// params receive the URL params (e.g. in /users/123, params.id will be 123)
export const show = ({ params }, res, next) =>
  User.findById(params.id)
    // verify if the resource exists
    .then(notFound(res))
    // from now we need to verify if the resource exists because notFound returns null if it doesn't
    .then((user) => user ? user.view() : null)
    .then(success(res))
    .catch(next)

// the passport middleware populates the user property
export const showMe = ({ user }, res) =>
  // user.view(true) to render a FULL view
  res.json(user.view(true))

// As well as querymen, bodymen property is passed by its middleware (see
// https://github.com/diegohaz/bodymen)
export const create = ({ bodymen: { body } }, res, next) =>
  User.create(body)
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    })

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  // if PUT /users/me, it converts `me` to the current user id passed by the passport middleware
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      // verify if the current user is the same user or an admin
      if (!result) return null
      const isAdmin = user.role === 'admin'
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    // use lodash.merge to update the user entity
    .then((user) => user ? _.merge(user, body).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      // only the same user can edit his password
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: 'You can\'t change other user\'s password'
        })
        return null
      }
      return result
    })
    .then((user) => user ? user.set({ password: body.password }).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(next)
