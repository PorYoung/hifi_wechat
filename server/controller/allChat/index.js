import config from '../../../config/wechat'
import utils from '../../common/utils'
import sha1 from 'sha1'
const findByPagination = async(criterion, limit, page, callback) => {
    db.message
        .where(criterion)
        .count(function (err, total) {
            //总页数从，0开始
            const totalPageNum = parseInt(total / limit);
            // 超过总页数则返回null
            if (page > totalPageNum) {
                callback(err, null)
            } else {
                const start = limit * page
                db.message
                    .where(criterion)
                    .sort({
                        date: -1
                    })
                    .limit(limit)
                    .skip(start)
                    .exec(callback)
            }
        })
}

const findByPaginationAsync = page => {
    return new Promise((resolve, reject) => {
        findByPagination({}, 8, page, function (err, data) {
            if (err) reject(err)
            if (!data || data.length <= 0) {
                reject('-1')
            } else {
                resolve(data)
            }
        })
    })
}

export default class {
    static async allchat(req, res, next) {
        //读取数据库
        let userinfo = await db.connection.findOne({
            openid: req.query.openid
        })
        //存在该用户
        if (userinfo) {
            //生成signature签名
            let nonceStr = config.token
            let ticket = await utils.readFileSync('/../../jsapi_ticket.txt').catch(err => 
                console.log(err)
            )
            try {
                ticket = JSON.parse(ticket.toString()).ticket
            } catch (error) {
                console.log(error)
            }
            let timestamp = new Date().getTime()
            let jsapi_url = config.urlPrefix+'/allChat?openid='+req.session.openid
            let str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${jsapi_url}`
            let signature = sha1(str)

            return res.render('allChat', {
                nickname: userinfo.nickname,
                headimgurl: userinfo.headimgurl,
                appId: config.appID,
                timestamp: timestamp,
                nonceStr: config.token,
                signature: signature,
            })
        } else {
            //返回错误:重新登录
            return res.sendStatus(404)
        }
    }

    static async getmessage(req, res, next) {
        let status = ''
        let page = req.query.page
        page ?
            status = await findByPaginationAsync(page).catch(err => status = err) :
            status = '-1'
        res.send(status)
    }
}