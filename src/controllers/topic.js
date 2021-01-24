const Topic = require('../models/topic')
const User = require('../models/user')
const Question = require('../models/question')

class TopicCtl {
  async checkTopicIsExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) {
      ctx.throw(404, '话题不存在')
    }
    await next()
  }

  async find(ctx) {
    const { pageSize = 10, page = 1 } = ctx.query
    ctx.body = await Topic.find({ name: new RegExp(ctx.query.q) })
    .limit(parseInt(Math.abs(pageSize), 10))
    .skip((parseInt(Math.abs(page), 10) - 1) * Math.abs(pageSize))
  }

  async findById(ctx) {
    const { fields = ';' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => '+' + f).join(' ')
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    ctx.body = {
      topic
    }
  }

  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: {
        type: 'string',
        required: false
      },
      introduction: {
        type: 'string',
        required: false
      }
    })
    ctx.body = await new Topic(ctx.request.body).save()
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    ctx.body = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
  }

  async listTopicFollowers(ctx) {
    ctx.body = await User.find({
      followingTopics: ctx.params.id
    })
  }

  async listQuestions(ctx) {
    const questions = await Question.find({topics: ctx.params.id})
    ctx.body = {
      questions
    }
  }
}

module.exports = new TopicCtl()
