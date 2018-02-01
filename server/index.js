import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import xmlparser from 'express-xml-bodyparser'
import router from './router' //api
import db from './common/mongoose' //数据库连接句柄
import http from 'http'
import socketio from 'socket.io'
import socketHandle from './socket' //socket要实现的具体逻辑

// 设置为全局数据库连接句柄
global.db = db

const app = express()
const server = http.createServer(app)
const io = socketio(server)
server.listen(3000)

//指定模板引擎
app.set('view engine', 'ejs')
//指定模板位置
app.set('views', __dirname + '/views')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(xmlparser())

// cookie、session配置
app.use(session({
  secret: 'Song',
  cookie: {
    maxAge: 60 * 1000 * 30
  },
  resave: false,
  saveUninitialized: true,
}))

app.use(router)

app.get(['/', '/index.html'], (req, res) => {
  res.send('hello world!')
})
app.get('/video', (req, res) => {
  // res.send('Hello world!')
  if (req.query.scene) {
    if (req.query.scene === 'phone')
      res.render('video', {
        remoteVideo: 'false',
        localVideo: 'true'
      })
    else if (req.query.scene === 'screen')
      res.render('video', {
        remoteVideo: 'true',
        localVideo: 'false'
      })
    else {
      return res.redirect('/wall')
    }
  } else {
    return res.redirect('/wall')
  }
})

const allChat = io.of('/allChat')
allChat.on('connection', socket =>
  socketHandle.handle(socket)
)

module.exports = app
