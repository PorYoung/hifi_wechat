//引包
import mongoose from '../config'
//设计连接用户类模板
const connectionSchema = new mongoose.Schema({
  //微信用户验证信息
  access_token: String,
  expires_in: String,
  refresh_token: String,
  openid: String,
  //微信用户名
  nickname : String,
  sex : String,
  province : String,
  //socket_io提供的socket_id
  socketId : String,
  //微信头像
  headimgurl : String,
  //投票信息
  vote: Object,
  //参与互动次数
  times : Number,
  //是否被拉入黑名单
  shield: Boolean,
  lottery: String

})
const connection = mongoose.model('connection', connectionSchema)
export default connection
