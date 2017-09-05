var mongoose = require('./mongoose')
//配置数据库
var settings = {
    "url" : "mongodb://localhost/wechat",
    useMongoClient : {useMongoClient:true}
}
//连接数据库
var db = mongoose.createConnection(settings.url,settings.useMongoClient);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('数据库链接成功')
})


//设计连接用户类模板
var connectionSchema = new mongoose.Schema({
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
    //参与互动次数
    times : Number
})
var connection = db.model('connection',connectionSchema)
//设计消息类模板
var messageSchema = new mongoose.Schema({
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
var message = db.model('message',messageSchema)
//设置日志类模板
var logSchema = new mongoose.Schema({
    content : String,
    date : String
})
var log = db.model('log',logSchema)

module.exports = {
    connection : connection,
    message : message,
    log : log
}