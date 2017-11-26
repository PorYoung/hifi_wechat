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
                console.log(message)
                if(!!message.eventkey){
                    //用户扫码关注公众号
                    //后续需要对参数进行判断
                    var username = message.eventkey.slice(message.eventkey.indexOf("_")+1)
                    content.MsgType = 'news'
                    content.news = []
                    let news1 = {
                        title: '欢迎关注HIFI | 赶快点击进入发弹幕吐槽吧-.-',
                        description: '赶快点击进入发弹幕吐槽吧-.-',
                        picurl: config.urlPrefix + '/static/image/logo.png',
                        url: config.urlPrefix + '/start?username='+username
                    }
                    let news2 = {
                        title: 'Tips | 回复1参与正在进行的活动吧',
                        description: '回复1参与正在进行的活动吧'
                    }
                    content.news.push(news1)
                    content.news.push(news2)
                }else{
                    content.MsgType = 'text'
                    content.content = '欢迎关注公众号,回复1参与正在进行的活动吧'
                }
            } else if (message.event === 'SCAN'){
                var username = message.eventkey.slice(message.eventkey.indexOf("_")+1)
                content.MsgType = 'news'
                content.news = []
                let news1 = {
                    title: '欢迎回到HIFI | 赶快点击进入发弹幕吐槽吧-.-',
                    description: '赶快点击进入发弹幕吐槽吧-.-',
                    picurl: config.urlPrefix + '/static/image/logo.png',
                    url: config.urlPrefix + '/start?username='+username
                }
                content.news.push(news1)
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
            // if (message.content === '1') {
                content.MsgType = 'news'
                content.news = []
                let news1 = {
                    title: '正在进行的活动',
                    description: '赶快点击进入发弹幕吐槽吧-.-',
                    picurl: config.urlPrefix + '/static/image/logo.png',
                    url: config.urlPrefix + '/start?username=Por'
                }
                content.news.push(news1)
            // }
            // } else if (message.content === '2') {
            //     content.MsgType = 'text'
            //     content.content = 'hi'
            // }
            // } else {
            //     content.MsgType = 'text'
            //     // 后续考虑实现
            //     // content.content = '别调戏我啊，回复3去调戏机器人吧~.~'
            //     content.content = "Sorry, I can't understand *_*"
            // }
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
        let username = req.query.username
        let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appID}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`
        let data = await utils.httpsGetJSON(url).catch(err => console.log(err))
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
        return res.redirect('/allChat?openid=' + user.info.openid + '&username=' + username)
    }

    //引导微信用户进行验证的跳转页面
    static async start(req, res, next) {
        let username = !!req.query.username?req.query.username:"Por"
        return res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${encodeURIComponent(config.urlPrefix + '/api/authorization?username=' + username)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`)
    }

    //获取用户带场景值二维码
    static async getQR(req,res,next){
        let username = req.query.username
        if(!username) return res.send('-1')
        let access_token = await utils.readFileSync('/../../access_token.txt').catch(err => console.log(err))
        try { access_token = JSON.parse(access_token.toString()).access_token} 
        catch (error) { console.log(error) }

        let url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${access_token}`
        let info = '{"action_name":"QR_LIMIT_STR_SCENE","action_info":{"scene":{"scene_str":"'+username+'"}}}'
        let data = await utils.httpsPostJSON(url,info).catch(err => console.log(err))
        if(!data || !data.ticket) return res.send('-2')

        url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURI(data.ticket)
        let filename = '/image/users/QR_' + username + '.jpg'
        let QRSrc = await utils.httpsGetFile(url,filename).catch(err => console.log(err))
        if(!QRSrc) return res.send('-2')
        let query = await db.wall.findOneAndUpdate({username:username},{QRTicket:data.ticket,QRSrc:QRSrc},{upsert:false,new:true})
        if(!query) return res.send('-1')
        else return res.send(QRSrc)
    }

    async get_wechatImage(id){
        let url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID`
    }
}