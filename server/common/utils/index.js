import fs from 'fs'
import path from 'path'
import https from 'https'
import {URL} from 'url'

const readFileSync = dir => {
    return new Promise((resolve,reject) => {
        fs.readFile(path.join(__dirname,dir),(err,data) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
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
const httpsPostJSON = (url,info) => {
    url = new URL(url)
    let postData = info
    let options = {
        hostname: url.host,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    }
    return new Promise((resolve,reject) => {
        let req = https.request(options,res => {
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
            res.on('err', err => {
                consloe.log(err)
                reject(err)
            })
        })
        req.write(postData);
        req.end();
    })
}
const httpsGetFile = (url,filename) => {
    return new Promise((resolve,reject) => {
            let wOption = {
                flags: 'a',
                encoding: null,
                mode: 0o666
            }
            let fileWriteStream = fs.createWriteStream(path.join(__dirname,'/../../../static/'+filename),wOption);
            https.get(url,res => {
                try{
                    let status = JSON.parse(res.headers)
                    if(!!status.connection&&status.connection=="close") reject(err)
                }catch(err){
                    //需要优化
                }
                res.on('data',data=>{
                    fileWriteStream.write(data)
                })
                res.on('end',()=>{
                  fileWriteStream.end()
                  let src = '/static' + filename
                  resolve(src)
                })
                res.on('err',err=>reject(err))
            })
    })
}

export default {
    readFileSync,
    httpsGetJSON,
    httpsGetFile,
    httpsPostJSON
}