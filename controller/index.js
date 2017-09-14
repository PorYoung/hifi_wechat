const koaRouter = require('koa-router') 
const router = koaRouter()

const allChatRouter = require('./allChat')
const userRouter = require('./user')
const wechatRouter = require('./wechat')

router
    .use(allChatRouter.routes(), allChatRouter.allowedMethods())
    .use(userRouter.routes(), userRouter.allowedMethods())
    .use(wechatRouter.routes(), wechatRouter.allowedMethods())

module.exports = router