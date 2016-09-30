import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { session } from '../../services/passport'
import { create, index, show, update, destroy } from './article.controller'
import { schema } from './article.model'
export Article, { schema } from './article.model'

const router = new Router()
const { title, content } = schema.tree

/**
 * @api {post} /articles Create article
 * @apiName CreateArticle
 * @apiGroup Article
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam title Article's title.
 * @apiParam content Article's content.
 * @apiSuccess {Object} article Article's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Article not found.
 * @apiError 401 user access only.
 */
router.post('/',
  session({ required: true }),
  body({ title, content }),
  create)

/**
 * @api {get} /articles Retrieve articles
 * @apiName RetrieveArticles
 * @apiGroup Article
 * @apiUse listParams
 * @apiSuccess {Object[]} articles List of articles.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /articles/:id Retrieve article
 * @apiName RetrieveArticle
 * @apiGroup Article
 * @apiSuccess {Object} article Article's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Article not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /articles/:id Update article
 * @apiName UpdateArticle
 * @apiGroup Article
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam title Article's title.
 * @apiParam content Article's content.
 * @apiSuccess {Object} article Article's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Article not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  session({ required: true }),
  body({ title, content }),
  update)

/**
 * @api {delete} /articles/:id Delete article
 * @apiName DeleteArticle
 * @apiGroup Article
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Article not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  session({ required: true }),
  destroy)

export default router
