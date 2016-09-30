import { sign } from '../../services/jwt'
import { success } from '../../services/response/'

export const login = ({ user }, res, next) =>
  // it returns a JSON Web Token
  sign(user.id)
    // send the token and the current user to the response
    .then((token) => ({ token, user: user.view(true) }))
    .then(success(res, 201))
    .catch(next)
