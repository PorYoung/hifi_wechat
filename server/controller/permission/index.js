import url from 'url'

export default class {
  static loginRequire(req, res, next){
    const openid = url.parse(req.query.origin || '', true).query.openid

    //后期需要对不同用户进行鉴权
    if(req.session.username && req.query.origin){
      console.log(req.session.username)
    }else if (!req.session.openid || !openid || req.session.openid !== openid) {
      return res.sendStatus(403)
    }
    next()
  }
}