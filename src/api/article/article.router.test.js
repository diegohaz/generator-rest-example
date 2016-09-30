import test from 'ava'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import routes, { Article } from '.'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  const [ user, anotherUser, admin ] = await User.create([
    { email: 'a@a.com', password: '123456' },
    { email: 'b@b.com', password: '123456' },
    { email: 'c@c.com', password: '123456', role: 'admin' }
  ])
  const [ userSession, anotherSession, adminSession ] = [
    signSync(user.id), signSync(anotherUser.id), signSync(admin.id)
  ]
  const article = await Article.create({ author: user })
  t.context = { ...t.context, userSession, anotherSession, adminSession, article }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Article.remove()])
})

test.serial('POST /articles 201 (user)', async (t) => {
  const { userSession } = t.context
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, title: 'test', content: 'test' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.title === 'test')
  t.true(body.content === 'test')
  t.true(typeof body.author === 'object')
})

test.serial('POST /articles 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /articles 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /articles/:id 200', async (t) => {
  const { article } = t.context
  const { status, body } = await request(app())
    .get(`/${article.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === article.id)
})

test.serial('GET /articles/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /articles/:id 200 (user)', async (t) => {
  const { userSession, article } = t.context
  const { status, body } = await request(app())
    .put(`/${article.id}`)
    .send({ access_token: userSession, title: 'test', content: 'test' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === article.id)
  t.true(body.title === 'test')
  t.true(body.content === 'test')
  t.true(typeof body.author === 'object')
})

test.serial('PUT /articles/:id 401 (user) - another user', async (t) => {
  const { anotherSession, article } = t.context
  const { status } = await request(app())
    .put(`/${article.id}`)
    .send({ access_token: anotherSession, title: 'test', content: 'test' })
  t.true(status === 401)
})

test.serial('PUT /articles/:id 401', async (t) => {
  const { article } = t.context
  const { status } = await request(app())
    .put(`/${article.id}`)
  t.true(status === 401)
})

test.serial('PUT /articles/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test', content: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /articles/:id 204 (user)', async (t) => {
  const { userSession, article } = t.context
  const { status } = await request(app())
    .delete(`/${article.id}`)
    .query({ access_token: userSession })
  t.true(status === 204)
})

test.serial('DELETE /articles/:id 401 (user) - another user', async (t) => {
  const { anotherSession, article } = t.context
  const { status } = await request(app())
    .delete(`/${article.id}`)
    .send({ access_token: anotherSession })
  t.true(status === 401)
})

test.serial('DELETE /articles/:id 401', async (t) => {
  const { article } = t.context
  const { status } = await request(app())
    .delete(`/${article.id}`)
  t.true(status === 401)
})

test.serial('DELETE /articles/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  t.true(status === 404)
})
