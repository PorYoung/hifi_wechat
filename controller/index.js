import koaRouter from 'koa-router'

//引入子路由
import allChatRouter from './allChat'
import userRouter from './user'
import wechatRouter from './wechat'

const router = koaRouter()

router
    .use(allChatRouter.routes(), allChatRouter.allowedMethods())
    .use(userRouter.routes(), userRouter.allowedMethods())
    .use(wechatRouter.routes(), wechatRouter.allowedMethods())

export default router