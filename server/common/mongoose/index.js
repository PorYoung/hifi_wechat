//连接数据库
import dbConnetion from './connection' 
//引入数据库操作模型
import connection from './modules/connection'
import message from './modules/message'
import log from './modules/log'

const db = {
  dbConnetion,
  connection,
  message,
  log
}

export default db