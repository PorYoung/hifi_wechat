import express from 'express'
//引入子路由
import allChatRouter from './allChat'
import wechatRouter from './wechat'
import wallRouter from './wall'

const apiRouter = express.Router()


apiRouter
    .use(allChatRouter)
    .use(wechatRouter)
    .use(wallRouter)

export default apiRouter