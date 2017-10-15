let https = require('https');
let fs =require('fs')
let getSync = () => {
    return new Promise((resolve,reject) => {
        https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxfe86c090e3d88f8c&secret=83ce792f93bab7df544fecae73725859',(res) => {
            res.on('data',(d)=>{
                resolve(d)
            })
            .on('err',(err)=>{
                reject(err)
            })
        })
    })
}

async function fn() {
    let value = await function() {
        return new Promise((resolve,reject) => {
            https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxfe86c090e3d88f8c&secret=83ce792f93bab7df544fecae73725859',(res) => {
                res.on('data',(d)=>{
                    resolve(d)
                })
                .on('err',(err)=>{
                    reject(err)
                })
            })
        })
    }()
    return value
}
fn()
    .then((data)=>{
        // console.log(data.toString())
        fs.writeFileSync('./access_token.txt',data)
        let info = fs.readFileSync('./access_token.txt')
        info = info.toString()
        console.log(info)
    })
    .catch(err=>console.log(err))