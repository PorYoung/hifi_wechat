//连接数据库
const dbConnetion = require('./connection') 
//引入数据库操作模型
const connection = require('./modules/connection')
const message = require('./modules/message')
const log = require('./modules/log')

const db = {
  dbConnetion,
  connection,
  message,
  log
}

module.exports = db