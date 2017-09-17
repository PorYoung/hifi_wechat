import express from 'express'
//API请求路由
import apiRouter from './api'
//页面渲染路由
import pageRouter from './page'

const router = express.Router()

router
  .use('/api', apiRouter)
  .use(pageRouter)

export default router