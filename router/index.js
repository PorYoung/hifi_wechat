import koaRouter from 'koa-router'
//API请求路由
import apiRouter from './api'
//页面渲染路由
import pageRouter from './page'

const router = new koaRouter()

router
  .use(apiRouter.routes(), apiRouter.allowedMethods())
  .use(pageRouter.routes(), pageRouter.allowedMethods())

export default router