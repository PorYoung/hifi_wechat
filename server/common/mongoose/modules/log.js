import mongoose from '../config'
//设置日志类模板
const logSchema = new mongoose.Schema({
  content : String,
  date : String
})
const log = mongoose.model('log', logSchema)
export default log
