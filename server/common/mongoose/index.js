//连接数据库
import dbConnetion from './connection' 
//引入数据库操作模型
import connection from './modules/connection'
import user from './modules/user'
import message from './modules/message'
import log from './modules/log'
import wall from './modules/wall'

const db = {
  dbConnetion,
  user,
  connection,
  message,
  log,
  wall
}

export default db