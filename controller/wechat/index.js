import koaRouter from 'koa-router'

import sha1 from 'sha1'
import Wechat from '../../model/wechatApi'
import template from '../../model/wechatResponse'
import https from 'https'

const router = koaRouter()
const config = {
    appID: 'wx3515b2c2a1e58b5c',
    appSecret: 'a23009c2e4f0af1688c84661014bcbb1',
    token: 'PorYoung',
    urlPrefix: 'http://api.wechat.tutorhelp.cn',
}
let user = {
    info: {},
    autoRefreshToken: {}
}
let allUsers = {}
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
const refreshToken = async(refresh_token) => {
    let url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${config.appID}&grant_type=refresh_token&refresh_token=${refresh_token}`
    let data = await httpsGetJSON(url).catch(err => console.log(err))
    if (!data.access_token) {
        console.log(data.errcode + ' | ' + data.errmsg)
    } else {
    /**
     * bug 重灾区
     * bug 重灾区
     * bug 重灾区
     * bug 重灾区
     * bug 重灾区
     * bug 重灾区
     * bug 重灾区
     */
        user.info = data
        user.info.expires_in = new Date().getTime() + data.expires_in * 1000
    }
}
//微信与服务器的验证
const get_wechat = async(ctx, next) => {
    const token = config.token
    const {
        timestamp,
        nonce,
        signature
    } = ctx.query
    let arr = [token, timestamp, nonce].sort()
    const str = sha1(arr.join(''))
    if (str === signature) {
        ctx.body = ctx.query.echostr
    } else {
        ctx.body = "error"
        console.log("error")
    }
    const wechat = new Wechat(config)
}
//处理微信推送的消息
const post_wechat = async(ctx, next) => {
    let xmlData = ctx.request.body
    xmlData = xmlData.xml
    let message = {}
    for (let key in xmlData) {
        message[key] = xmlData[key][0]
    }
    //回复
    let content = {}
    //事件消息
    content.toUser = message.FromUserName
    content.fromUser = message.ToUserName
    content.createTime = new Date().getTime()
    if (message.MsgType === 'event') {
        //订阅事件
        if (message.Event === 'subscribe') {
            content.MsgType = 'text'
            content.content = '欢迎关注公众号'
        }
        //地理位置
        else if (message.Event === 'LOCATION') {
            content.MsgType = 'text'
            content.content = '您的位置是：纬度 ' + message.Latitude + '\n经度 ' + message.Longitude + '\n精度 ' + message.Precision
        }
    }
    //普通消息
    else if (message.MsgType === 'text') {
        //利用message.MsgId 查重
        //注意编码问题
        //1:跳转到授权界面获取code,并用code获取access_token
        if (message.Content === '1') {
            content.MsgType = 'news'
            content.news = []
            let news1 = {
                title: 'Link',
                description: 'click to redirect to new page',
                picurl: config.urlPrefix + '/images/1.jpg',
                url: config.urlPrefix + '/start'
            }
            content.news.push(news1)
        } else if (message.Content === '2') {
            content.MsgType = 'text'
            content.content = 'hi'
        } else {
            content.MsgType = 'text'
            content.content = 'I can not understand'
        }
    } else if (message.MsgType === 'image') {
        content.MsgType = 'image'
        content.media_id = message.MediaId
    } else {
        content.MsgType = 'text'
        content.content = 'I can not understand'
    }
    ctx.body = template.compiled({
        content
    })
}
//处理微信用户验证
const userinfo_wechat = async(ctx, next) => {
    const code = ctx.query.code
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appID}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`
    let data = await httpsGetJSON(url).catch(err => console.log(err))
    if (!data.access_token) {
        console.log(data.errcode + ' | ' + data.errmsg)
        ctx.body = data.errmsg
        return
    } else {
        user.info = data
        user.info.expires_in = new Date().getTime() + data.expires_in * 1000
        //授权成功，判断access_token是否有效
        allUsers.hasOwnProperty(user.info.openid) || (allUsers[user.info.openid] = user.info.access_token)

        isAccessTokenValid(user.info) || refreshToken(user.info.access_token)
    }
    //拉取用户信息，存入用户数据库中
    url = `https://api.weixin.qq.com/sns/userinfo?access_token=${user.info.access_token}&openid=${user.info.openid}&lang=zh_CN`
    data = await httpsGetJSON(url).catch(err => console.log(err))
    Object.assign(user.info, data)
    if (data.openid) {
        user.autoRefreshToken.hasOwnProperty(data.openid) ||
            (user.autoRefreshToken[data.openid] = setInterval(() => {
                refreshToken(allUsers[data.openid])
            }, 7200 * 1000 - 100))
        let info = await db.connection.findOneAndUpdate({
            openid: data.openid
        }, {
            access_token: user.info.access_token,
            expires_in: user.info.expires_in,
            refresh_token: user.info.refresh_token,
            openid: user.info.openid,
            nickname: user.info.nickname,
            sex: user.info.sex,
            province: user.info.province,
            headimgurl: user.info.headimgurl
        }, {
            new: true,
            upsert: true
        })

        db.log.create({
            content: '用户:' + info.nickname + ' openid:' + info.openid + '通过微信连接成功',
            date: new Date().getTime()
        }, err => {
            err && console.log(err + ' ' + info.nickname + ' 用户通过微信连接失败')
        })
    } else {
        console.log(data.errcode + ' | ' + data.errmsg)
        ctx.body = data.errmsg
        return
    }
    ctx.redirect('/allChat?openid=' + user.info.openid)
}

//引导微信用户进行验证的跳转页面
const start = async(ctx, next) => {
    ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${encodeURIComponent(config.urlPrefix + '/authorization')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`)
}

router
    .get('/wechat', get_wechat)
    .post('/wechat', post_wechat)
    .get('/start', start)
    .get('/authorization', userinfo_wechat)

export default router