const Koa = require("koa")
const app = new Koa()
const staticServer = require('koa-static')
const xmlParser = require('koa-xml-body')
//解析post请求的数据
const bodyparser = require("koa-bodyparser")
//在处理请求前使用中间件
app.use(xmlParser())
app.use(bodyparser())
//自动读取文件夹中的js文件并引入
const controller = require("./controller");
//允许传入文件夹地址，默认路径__dirname + "/controller"
app.use(controller())
app.use(staticServer('./public'))
app.use(staticServer('./jquery-emoji'))
//创建socketio
const server = require('http').Server(app.callback()).listen(3000)
var io = require("socket.io")(server,{
    pingInterval: 6000*10,
    pingTimeout: 6000*5
})
//设为全局io
global.allChat  = io.of("/allChat");
allChat.on("connection",function (socket) {
  require("./controller/allChat.js").allChatCtl(allChat,socket);
})