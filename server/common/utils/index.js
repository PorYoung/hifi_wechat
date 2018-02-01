import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL } from 'url'

const superagent = require('superagent')

const readFileSync = dir => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, dir), (err, data) => {
      if (err) reject(err)
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
const httpsPostJSON = (url, info) => {
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
  return new Promise((resolve, reject) => {
    let req = https.request(options, res => {
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
        console.log(err)
        reject(err)
      })
    })
    req.write(postData)
    req.end()
  })
}
const httpsGetFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .end((err, res) => {
        if (err) {
          reject(err)
        }
        if (res.ok) {
          fs.writeFile(path.join(__dirname, '/../../../static/' + filename), res.body, error => {
            if (error) {
              reject(error)
            } else {
              const src = '/static' + filename
              resolve(src)
            }
          })
        }
      })
  })
}

export default {
  readFileSync,
  httpsGetJSON,
  httpsGetFile,
  httpsPostJSON
}