import https from 'https'
import fs from 'fs'
let config = {
    prefix: 'https://api.weixin.qq.com/cgi-bin/token?',
    appID: 'wxfe86c090e3d88f8c',
    appSecret: '83ce792f93bab7df544fecae73725859',
    access_token: '',
    expires_in: ''
}

export default class Wechat {
    constructor(opts) {
        Object.assign(config, opts)
        this.ReachAccessToken('firstGet')
        this.setIntervalGet()
    }

    getAccessTokenSync(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                res.on('data', data => resolve(data))
                res.on('err', err => reject(err))
            })
        })
    }

    updateAccessToken() {
        this.ReachAccessToken('update')
    }

    async ReachAccessToken(type) {
        const url = `${config.prefix}grant_type=client_credential&appid=${config.appID}&secret=${config.appSecret}`
        let data = await this.getAccessTokenSync(url).catch(err =>
            console.log(err)
        )
        try {
            data = JSON.parse(data)
        } catch (e) {
            console.log(e)
        }
        if (data.access_token && data.expires_in) {
            config.access_token = data.access_token
            config.expires_in = new Date().getTime() + data.expires_in * 1000
            this.isAccessTokenValid(data) ?
                fs.writeFile(__dirname + '/../access_token.txt', JSON.stringify(data), (err) => {
                    err && console.log(err)
                }) :
                this.updateAccessToken(opts)
        } else {
            if (type === 'firstGet') {
                console.log('第一次获取access_token失败 ' + data.toString())
                this.updateAccessToken()
            } else if (type === 'update') {
                console.log('更新获取access_token失败 ' + data.toString())
            }
        }
    }

    setIntervalGet() {
        setInterval(() => {
            //读取文件中的access_token和expires_in
            fs.readFile(__dirname + '/../access_token.txt', (err, data) => {
                err && console.log(err)
                try {
                    let info = JSON.parse(data.toString())
                    let now = new Date().getTime()
                    now >= info.expires_in - 100 && this.updateAccessToken()
                } catch (error) {
                    console.log(error)
                }
            })
        }, 7200 * 1000)
    }

    isAccessTokenValid(data) {
        return !!data.access_token && data.expires_in && new Date().getTime() < config.expires_in - 100
    }

}