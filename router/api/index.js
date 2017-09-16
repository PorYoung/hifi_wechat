import koaRouter from 'koa-router'

//引入子路由
import allChatRouter from './allChat'
import wechatRouter from './wechat'

const router = new koaRouter({
    prefix: '/api'
})

router
    .use(allChatRouter.routes(), allChatRouter.allowedMethods())
    .use(wechatRouter.routes(), wechatRouter.allowedMethods())

export default router