const sha1 = require('sha1')
const Wechat = require('../model/wechatApi')
const template = require('../model/wechatResponse')
const database = require('../model/database')
const https = require("https")
const config = {
    appID: 'wxfe86c090e3d88f8c',
    appSecret: '83ce792f93bab7df544fecae73725859',
    token: 'PorYoung',
    urlPrefix: 'http://poryoung.mynatapp.cc',
    autoRefreshToken: {}
}
const httpsGetJSON = url => {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            res.on('data', data => {
                let result
                try {
                    result = JSON.parse(data)
                } catch (error) {
                    error && console.log(error)
                    reject(error)
                }
                resolve(result)
            })
            res.on('err', err => reject(err))
        })
    })
}

const isAccessTokenValid = userinfo => {
    const now = new Date().getTime()
    return !!userinfo && now < userinfo.expires_in - 100
}
//重新获取token
const refreshToken = async () => {
    let url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${config.appID}&grant_type=refresh_token&refresh_token=${userinfo.refresh_token}`
    let data = await httpsGetJSON(url).catch(err => console.log(err))
    if(!data.access_token){
        console.log(data.errcode + ' | ' + data.errmsg)
    }else{
        config.userinfo = data
        config.userinfo.expires_in = new Date().getTime() + data.expires_in*1000
    }
}
//微信与服务器的验证
const get_wechat = async (ctx, next) => {
    let token = config.token
    let {timestamp, nonce, signature} = ctx.query
    let arr = [token, timestamp, nonce].sort()
    let str = sha1(arr.join(''))
    if(str === signature){
        ctx.body = ctx.query.echostr
    }else{
        ctx.body = "error"
        console.log("error")
    }
    const wechat = new Wechat(config)
}
//处理微信推送的消息
var post_wechat = async (ctx,next) => {
    let xmlData = ctx.request.body
    xmlData = xmlData.xml
    let message = {}
    for(let key in xmlData){
        message[key] = xmlData[key].toString()
    }
    //回复
    var content = {}
    //事件消息
    content.toUser = message.FromUserName
    content.fromUser = message.ToUserName
    content.createTime = new Date().getTime()
    if(message.MsgType === 'event'){
        //订阅事件
        if(message.EVENT === 'subscribe'){
            content.MsgType = 'text'
            content.content = '欢迎关注公众号'
        }
        //地理位置
        else if(message.EVENT === 'LOCATION'){
            content.MsgType = 'text'
            content.content = '您的位置是：纬度 '+message.Latitude+'\n经度 '+message.Longitude + '\n精度 '+message.Precision
        }
    }
    //普通消息
    else if(message.MsgType === 'text'){
        //利用message.MsgId 查重
        //注意编码问题
        //1:跳转到授权界面获取code,并用code获取access_token
        if(message.Content === '1'){
            content.MsgType = 'news'
            content.news = []
            let news1 = {
                title: 'Link',
                description: 'click to redirect to new page',
                picurl: config.urlPrefix + '/images/1.jpg',
                url: config.urlPrefix + '/start'
            }
            content.news.push(news1)
        }else if(message.Content === '2'){
            content.MsgType = 'text'
            content.content = 'hi'
        }else{
            content.MsgType = 'text'
            content.content = 'I can not understand'
        }
    }else if(message.MsgType === 'image'){
        content.MsgType = 'image'
        content.media_id = message.MediaId
    }else{
        content.MsgType = 'text'
        content.content = 'I can not understand'
    }
    ctx.body = template.compiled({content})
}
//处理微信用户验证
const userinfo_wechat = async (ctx, next) => {
    let code = ctx.query.code
    let userinfo = {}
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appID}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`
    let data = await httpsGetJSON(url).catch(err => console.log(err))
    if(!data.access_token){
        console.log(data.errcode + ' | ' + data.errmsg)
    }else{
        userinfo = data
        userinfo.expires_in = new Date().getTime() + data.expires_in * 1000
        //授权成功，判断access_token是否有效
        isAccessTokenValid(userinfo) || refreshToken()
    }
    //拉取用户信息，存入用户数据库中
    url = `https://api.weixin.qq.com/sns/userinfo?access_token=${userinfo.access_token}&openid=${userinfo.openid}&lang=zh_CN`
    data = await httpsGetJSON(url).catch(err => console.log(err))
    if(data.openid){
        let info = data
        info.access_token = userinfo.access_token
        info.expires_in = userinfo.expires_in
        info.refresh_token = userinfo.refresh_token
        info.scope = userinfo.scope
        userinfo = info
        config.autoRefreshToken.hasOwnProperty(userinfo.openid) || 
        (config.autoRefreshToken[userinfo.openid] = setInterval(() => {
            refreshToken()
        }, 7200*1000 - 100))
        info = await database.connection.findOneAndUpdate({openid:userinfo.openid},{
            access_token: userinfo.access_token,
            expires_in: userinfo.expires_in,
            refresh_token: userinfo.refresh_token,
            openid: userinfo.openid,
            nickname: userinfo.nickname,
            sex: userinfo.sex,
            province: userinfo.province,
            headimgurl: userinfo.headimgurl
        },{new:true,upsert:true})
        
        database.log.create({
            content: '用户:'+info.nickname+' openid:'+info.openid+'通过微信连接成功',
            date: new Date().getTime()
        },(err)=>{
            if(err) console.log(err+' '+info.nickname+' 用户通过微信连接失败')
        })
    }else{
        console.log(data.errcode + ' | '+ data.errmsg)
    }
    ctx.redirect('/allChat?openid='+userinfo.openid)
}

//引导微信用户进行验证的跳转页面
var start = async (ctx,next) => {
    ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${encodeURIComponent(config.urlPrefix + '/authorization')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`)
}
module.exports = {
    'GET /wechat' : get_wechat,
    'POST /wechat' : post_wechat,
    'GET /start' : start,
    'GET /authorization' : userinfo_wechat,
}