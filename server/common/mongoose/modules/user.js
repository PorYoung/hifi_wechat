//引包
import mongoose from '../config'
//设计使用用户类模板
const userSchema = new mongoose.Schema({
    //用户名
    username : String,
    password : String,
    province : String,
    //用户头像
    headimgurl : String
})
const user = mongoose.model('user', userSchema)
export default user