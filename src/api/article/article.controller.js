import _ from 'lodash'
import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Article } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Article.create({ ...body, author: user })
    .then((article) => article.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Article.find(query, select, cursor)
    .populate('author')
    .then((articles) => articles.map((article) => article.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Article.findById(params.id)
    .populate('author')
    .then(notFound(res))
    .then((article) => article ? article.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Article.findById(params.id)
    .populate('author')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((article) => article ? _.merge(article, body).save() : null)
    .then((article) => article ? article.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Article.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((article) => article ? article.remove() : null)
    .then(success(res, 204))
    .catch(next)
