const Koa = require("koa")
const app = new Koa()
const staticServer = require('koa-static')
const xmlParser = require('koa-xml-body')
//解析post请求的数据
const bodyparser = require("koa-bodyparser");
//在处理请求前使用中间件
app.use(xmlParser())
app.use(bodyparser())
//自动读取文件夹中的js文件并引入
const controller = require("./controller");
//允许传入文件夹地址，默认路径__dirname + "/controller"
app.use(controller())
app.use(staticServer('./public'))

app.listen(3000);