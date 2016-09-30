import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'
import { schema as userSchema } from '../user'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const Article = mongo.model('Article', schema)
  const User = mongo.model('User', userSchema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const article = await Article.create({ author: user, title: 'test', content: 'test' })

  t.context = { ...t.context, Article, article, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { article, user } = t.context
  const view = article.view()
  t.true(typeof view === 'object')
  t.true(view.id === article.id)
  t.true(typeof view.author === 'object')
  t.true(view.author.id === user.id)
  t.true(view.title === article.title)
  t.true(view.content === article.content)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('full view', (t) => {
  const { article, user } = t.context
  const view = article.view(true)
  t.true(typeof view === 'object')
  t.true(view.id === article.id)
  t.true(typeof view.author === 'object')
  t.true(view.author.id === user.id)
  t.true(view.title === article.title)
  t.true(view.content === article.content)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
