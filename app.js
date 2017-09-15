import Koa from 'koa'
import views from 'koa-views'
import staticServer from 'koa-static'
import xmlParser from 'koa-xml-body'
import bodyparser from 'koa-bodyparser'
//连接数据库
import db from './common/mongoose'
//处理api请求
import controller from './controller'
import http from 'http'
import socketio from 'socket.io'
//处理socket请求
import socketHandle from './socket'

// 设置为全局数据库连接句柄
global.db = db

const app = new Koa()
//在处理请求前使用中间件
app.use(xmlParser())
app.use(bodyparser())
app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))
//使用路由
app.use(controller.routes(), controller.allowedMethods())
app.use(staticServer('./public'))
app.use(staticServer('./jquery-emoji'))
//创建socketio
const server = http.Server(app.callback()).listen(3000)
const io = socketio(server, {
  pingInterval: 6000 * 10,
  pingTimeout: 6000 * 5
})

const allChat = io.of("/allChat")
allChat.on("connection", socket => 
  socketHandle.handle(socket)
)

module.exports = app