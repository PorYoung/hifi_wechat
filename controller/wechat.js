const sha1 = require('sha1');
const Wechat = require('../model/wechatApi')
const template = require('../model/wechatResponse')
const config = {
    appID: 'wxfe86c090e3d88f8c',
    appSecret: '83ce792f93bab7df544fecae73725859',
    token: 'PorYoung',
    userinfo: {}
}
//微信与服务器的验证
var get_wechat = async (ctx,next) => {
    let token = config.token;
    let timestamp = ctx.query.timestamp;
    let nonce = ctx.query.nonce;
    let signature = ctx.query.signature;
    let arr = [token,timestamp,nonce].sort();
    let str = sha1(arr.join(''));
    if(str === signature){
        ctx.body = ctx.query.echostr;
    }else{
        ctx.body = "error";
        console.log("error");
    }
    var wechat = new Wechat(config)
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
            news1 = {}
            news1.title = 'Link'
            news1.description = 'click to redirect to new page'
            news1.picurl = 'https://poryoung.mynatapp.cc/images/1.jpg'
            news1.url = 'https://poryoung.mynatapp.cc/start'
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
    let info = template.compiled({content})
    ctx.body = info
}
//处理微信用户验证
var userinfo_wechat = async (ctx,next) => {
    let code = ctx.query.code
    function getAccessToken(){
        return new Promise((resolve,reject)=>{
            let url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.appID+'&secret='+config.appSecret+'&code='+code+'&grant_type=authorization_code'
            require('https').get(url,(res)=>{
                res.on('data',data=>resolve(data))
                res.on('err',err=>reject(err))
            })
        })
    }
    await getAccessToken()
    .then(data=>{
        try{
            data = JSON.parse(data)
        }catch(e){
            console.log(e)
        }
        if(!data.access_token){
            console.log(data.errcode + ' | ' + data.errmsg)
        }else{
            config.userinfo = data
            config.userinfo.expires_in = new Date().getTime() + data.expires_in*1000
            //授权成功，判断access_token是否有效
            if(!isAccessTokenValid(config.userinfo)){
                refreshToken()
            }
            //拉取用户信息，存入用户数据库中
            return new Promise((resolve,reject)=>{
                let url = 'https://api.weixin.qq.com/sns/userinfo?access_token='+config.userinfo.access_token+'&openid='+config.userinfo.openid+'&lang=zh_CN'
                require('https').get(url,(res)=>{
                    res.on('data',data=>resolve(data))
                    res.on('err',err=>reject(err))
                })
            }) 
        }
    })
    .then((data)=>{
        try{
            data = JSON.parse(data)
        }catch(e){
            console.log(e)
        }
        if(data.openid){
            config.userinfo.nickname = data.nickname
            config.userinfo.sex = data.sex
            config.userinfo.province = data.province
            config.userinfo.headimgurl = data.headimgurl
        }else{
            console.log(data.errcode + ' | '+ data.errmsg)
        }
    })
    .catch(err=>console.log(err))
    .catch(err=>console.log(err))
    
    setInterval(()=>{
        refreshToken()
    },7200*1000-100)
    ctx.redirect('/app');
}
//主程序
var APP = async (ctx,next)=>{
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
        <a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfe86c090e3d88f8c&redirect_uri=${encodeURIComponent('https://poryoung.mynatapp.cc/authorization')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'>跳转</a>
        <div>
    `
}

function isAccessTokenValid(userinfo){
    const now = new Date().getTime()
    return !!userinfo && !(now >= userinfo.expires_in - 100)
}
async function refreshToken(){
    function getAccessToken(){
        return new Promise((resolve,reject)=>{
            let url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+config.appID+'&grant_type=refresh_token&refresh_token='+userinfo.refresh_token 
            require('https').get(url,(res)=>{
                res.on('data',data=>resolve(data))
                res.on('err',err=>reject(err))
            })
        })
    }
    await getAccessToken().then(data=>{
        if(!data.access_token){
            console.log(data.errcode + ' | ' + data.errmsg)
        }else{
            try{
                data = JSON.parse(data)
                config.userinfo = data
                config.userinfo.expires_in = new Date().getTime() + data.expires_in*1000
            }catch(e){
                console.log(e)
            }
        }
    }).catch(err=>console.log(err))
}
module.exports = {
    'GET /wechat' : get_wechat,
    'POST /wechat' : post_wechat,
    'GET /start' : start,
    'GET /authorization' : userinfo_wechat,
    'GET /app' : APP
}
