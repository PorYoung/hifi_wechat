const Koa = require("koa")
const staticServer = require('koa-static')
const xmlParser = require('koa-xml-body')
const bodyparser = require("koa-bodyparser")
//连接数据库
const db = require('./common/mongoose')
/**
 * 
 */
//处理socket请求
const socketHandle = require("./socket")

// 设置为全局数据库连接句柄
global.db = db

const app = new Koa()
//在处理请求前使用中间件
app.use(xmlParser())
app.use(bodyparser())
app.use(require('koa-views')(__dirname + '/views', {
  extension: 'ejs'
}))
//自动读取文件夹中的js文件并引入
const controller = require("./controller")
app.use(controller.routes(), controller.allowedMethods())
app.use(staticServer('./public'))
app.use(staticServer('./jquery-emoji'))
//创建socketio
const server = require('http').Server(app.callback()).listen(3000)
var io = require("socket.io")(server, {
  pingInterval: 6000 * 10,
  pingTimeout: 6000 * 5
})

const allChat = io.of("/allChat")
allChat.on("connection", function (socket) {
  socketHandle.handle(socket)
})