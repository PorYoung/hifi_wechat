//引包
import mongoose from '../config'
//设计使用用户类模板
const userSchema = new mongoose.Schema({
    //用户名+密码+其他设置
    username : String,
    password : String,
    settings : Object,
    socketId : String,
    active: Boolean
})
const user = mongoose.model('user', userSchema)
export default user