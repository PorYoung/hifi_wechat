import express from 'express'
//引入子路由
import allChatRouter from './allChat'
import wechatRouter from './wechat'

const apiRouter = express.Router()


apiRouter
    .use(allChatRouter)
    .use(wechatRouter)

export default apiRouter