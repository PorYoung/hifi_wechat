import mongoose from '../config'
//设计消息类模板
const messageSchema = new mongoose.Schema({
  from : String,
  //发送者头像
  headimgurl : String,
  date : String,
  //消息类型
  MSgType : String,
  content : String,
  //微信提供的用于获取资源的media_id
  media_id : String
})
const message = mongoose.model('message', messageSchema)
export default message