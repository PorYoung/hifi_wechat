import sha1 from 'sha1'
import Wechat from '../../model/wechatApi'
import template from '../../model/wechatResponse'
import utils from '../../common/utils'
import config from '../../../config/wechat'

const wechat = new Wechat(config)
wechat.setIntervalGet()

let user = {
    info: {}
}

export default class {
    //微信与服务器的验证
    static async get_wechat(req, res, next) {
        const token = config.token
        console.log(req.query)
        const {
            timestamp,
            nonce,
            signature
        } = req.query
        let arr = [token, timestamp, nonce].sort()
        const str = sha1(arr.join(''))
        if (str === signature) {
            res.send(req.query.echostr)
        } else {
            res.send("error")
            console.log("error")
        }
        const wechat = new Wechat(config)
    }
    //处理微信推送的消息
    static async post_wechat(req, res, next) {
        const xmlData = req.body.xml
        let message = {}
        for (let key in xmlData) {
            message[key] = xmlData[key][0]
        }
        //回复
        let content = {}
        //事件消息
        content.toUser = message.fromusername
        content.fromUser = message.tousername
        content.createTime = new Date().getTime()
        if (message.msgtype === 'event') {
            //订阅事件
            if (message.event === 'subscribe') {
                content.MsgType = 'text'
                content.content = '欢迎关注公众号'
            }
            //地理位置
            else if (message.event === 'LOCATION') {
                content.MsgType = 'text'
                content.content = '您的位置是：纬度 ' + message.latitude + '\n经度 ' + message.longitude + '\n精度 ' + message.precision
            }
        }
        //普通消息
        else if (message.msgtype === 'text') {
            //利用message.MsgId 查重
            //注意编码问题
            //1:跳转到授权界面获取code,并用code获取access_token
            if (message.content === '1') {
                content.MsgType = 'news'
                content.news = []
                let news1 = {
                    title: 'Link',
                    description: 'click to redirect to new page',
                    picurl: config.urlPrefix + '/static/image/1.jpg',
                    url: config.urlPrefix + '/start'
                }
                content.news.push(news1)
            } else if (message.content === '2') {
                content.MsgType = 'text'
                content.content = 'hi'
            } else {
                content.MsgType = 'text'
                content.content = 'I can not understand'
            }
        } else if (message.msgtype === 'image') {
            content.MsgType = 'image'
            content.media_id = message.mediaid
        } else {
            content.MsgType = 'text'
            content.content = 'I can not understand'
        }
        return res.send(template.reply({ content }))
    }

    //处理微信用户验证
    static async authorization(req, res, next) {
        const code = req.query.code
        console.log("code:" + code)
        let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appID}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`
        let data = await utils.httpsGetJSON(url).catch(err => console.log(err))
        // console.log("正在处理微信用户验证")
        // console.log(data)
        if (!data.access_token) {
            console.log(data.errcode + ' | ' + data.errmsg)
            return res.send(data.errmsg)
        } else {
            user.info = data
            user.info.expires_in = new Date().getTime() + data.expires_in * 1000

        }
        //拉取用户信息，存入用户数据库中
        url = `https://api.weixin.qq.com/sns/userinfo?access_token=${user.info.access_token}&openid=${user.info.openid}&lang=zh_CN`
        data = await utils.httpsGetJSON(url).catch(err => console.log(err))
        // console.log("正在拉取用户信息")
        // console.log(data)
        Object.assign(user.info, data)
        if (data.openid) {
            //鉴权标记
            req.session.openid = data.openid
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
            return res.send(data.errmsg)
        }
        // console.log('重定向到：' + '/allChat?openid=' + user.info.openid)
        return res.redirect('/allChat?openid=' + user.info.openid)
    }

    //引导微信用户进行验证的跳转页面
    static async start(req, res, next) {
        return res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${encodeURIComponent(config.urlPrefix + '/api/authorization')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`)
    }

    async get_wechatImage(id){
        let url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID`
    }
}