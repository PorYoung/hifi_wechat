const https = require('https')
const sha1 = require('sha1');
const Wechat = require('../model/wechatApi')
const template = require('../model/wechatResponse')
const config = {
    appID: 'wx3515b2c2a1e58b5c',
    appSecret: 'a23009c2e4f0af1688c84661014bcbb1',
    token: 'PorYoung',
    urlPrefix: 'http://api.wechat.tutorhelp.cn',
    userinfo: {}
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
const post_wechat = async (ctx, next) => {
    let xmlData = ctx.request.body
    xmlData = xmlData.xml
    let message = {}
    for(let key in xmlData){
        message[key] = xmlData[key][0]
    }
    //回复
    let content = {
        toUser: message.FromUserName,
        fromUser: message.ToUserName,
        createTime: new Date().getTime()
    }
    //事件消息
    if(message.MsgType === 'event'){
        //订阅事件
        if(message.Event === 'subscribe'){
            content.MsgType = 'text'
            content.content = '欢迎关注公众号'
        }
        //地理位置
        else if(message.Event === 'LOCATION'){
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
            /**
             * 推送一条图文消息
             */
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
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appID}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`
    let data = await httpsGetJSON(url).catch(err => console.log(err))
    if(!data.access_token){
        console.log(data.errcode + ' | ' + data.errmsg)
    }else{
        config.userinfo = data
        config.userinfo.expires_in = new Date().getTime() + data.expires_in * 1000
        //授权成功，判断access_token是否有效
        isAccessTokenValid(config.userinfo) || refreshToken()
    }
    //拉取用户信息，存入用户数据库中
    url = `https://api.weixin.qq.com/sns/userinfo?access_token=${config.userinfo.access_token}&openid=${config.userinfo.openid}&lang=zh_CN`
    data = await httpsGetJSON(url).catch(err => console.log(err))
    if(data.openid){
      const {nickname, sex, province, headimgurl} = data
      config.userinfo = {nickname, sex, province, headimgurl}
    }else{
        console.log(data.errcode + ' | '+ data.errmsg)
    }
    setInterval(() => {
        refreshToken()
    }, 7200*1000 - 100)
    ctx.redirect('/app');
}
//主程序
var APP = async (ctx, next)=>{
    ctx.body = `<h1 style="text-align:center">userinfo</h1>
    <div style="text-align:center;font-size:32px;">
        <p>Name: ${config.userinfo.nickname}</p>
        <p>sex: ${config.userinfo.sex}</p>
        <p><img src="${config.userinfo.headimgurl}" style="width:60px;height:60px;border-radius:50%"></p>
    </div>`
}
//引导微信用户进行验证的跳转页面
var start = async (ctx,next) => {
    ctx.body = `
        <h1 style="width:100%;text-align:center">跳转</h1>
        <div style="width:100%;border:solid 1px #ccc;text-align:center;height:80px;font-size:36px;line-height:80px;">
        <a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${encodeURIComponent(config.urlPrefix + '/authorization')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'>跳转</a>
        <div>
    `
}

module.exports = {
    'GET /wechat' : get_wechat,
    'POST /wechat' : post_wechat,
    'GET /start' : start,
    'GET /authorization' : userinfo_wechat,
    'GET /app' : APP
}
