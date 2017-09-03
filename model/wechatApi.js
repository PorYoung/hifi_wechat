const https = require('https')
const fs = require('fs')
const config = {
    prefix: 'https://api.weixin.qq.com/cgi-bin/token?',
    appID: 'wxfe86c090e3d88f8c',
    appsecret: '83ce792f93bab7df544fecae73725859',
    access_token: '',
    expires_in: ''
}

const Wechat = function(opts){
    var that = this
    appid = opts.appID || config.appID
    secret = opts.appsecret || config.appsecret
    url = config.prefix + 'grant_type=client_credential&appid=' + appid + '&secret=' + secret
    async function getAccessTokenSync(){
        let value = await (()=>{
            return new Promise((resolve,reject)=>{
                https.get(url,(res)=>{
                    res.on('data',data=>resolve(data))
                    res.on('err',err=>reject(err))
                })
            })
        })()
        return value
    }
    getAccessTokenSync().then((data)=>{
        try{
            data = JSON.parse(data)
        }catch(e){
            console.log(e)
        }
        if(data.access_token && data.expires_in){
            config.access_token = data.access_token
            config.expires_in = new Date().getTime() + data.expires_in*1000
            if(!that.isAccessTokenValid(data)){
                that.updateAccessToken(opts)
            }else{
                //写入静态文件
                fs.writeFileSync(__dirname+'/../access_token.txt',JSON.stringify(data))
            }
        }else{
            console.log('第一次获取access_token失败 ' + data.toString())
            that.updateAccessToken(opts)
        }
    }).catch(err=>console.log(err))    
    //主动刷新access_token
    setInterval(()=>{
        //读取文件中的access_token和expires_in
        let info = fs.readFileSync(__dirname+'/../access_token.txt')
        info = info.toString()
        try{
            info = JSON.parse(info)
        }catch(e){
            console.log(e)
        }
        let now = new Date().getTime()
        if(now >= info.expires_in - 100){
            that.updateAccessToken(opts)
        }
    },7200*1000)
}
    
Wechat.prototype.updateAccessToken = (opts) => {
    appid = opts.appID || config.appID
    secret = opts.appsecret || config.appsecret
    url = config.prefix + 'grant_type=client_credential&appid=' + appid + '&secret=' + secret
    async function getAccessTokenSync(){
        let value = await (()=>{
            return new Promise((resolve,reject)=>{
                https.get(url,(res)=>{
                    res.on('data',data=>resolve(data))
                    res.on('err',err=>reject(err))
                })
            })
        })()
        return value
    }
    getAccessTokenSync().then((data)=>{
        try{
            data = JSON.parse(data)
        }catch(e){
            console.log(e)
        }
        if(data.access_token && data.expires_in){
            config.access_token = data.access_token
            config.expires_in = new Date().getTime() + data.expires_in*1000
            //写入静态文件
            fs.writeFileSync(__dirname+'/../access_token.txt',JSON.stringify(data))
        }else{
            console.log('更新获取access_token失败 ' + data.toString())
        }
    }).catch(err=>console.log(err))
}
Wechat.prototype.isAccessTokenValid = (data) => {
    if(data.access_token && data.expires_in){
        let now = new Date().getTime()
        if(now < config.expires_in - 100){
            return true
        }else{
            return false
        }
    }else{
        return false
    }
}

module.exports = Wechat