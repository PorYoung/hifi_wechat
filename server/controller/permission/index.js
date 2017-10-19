import url from 'url'

export default class {
  static loginRequire(req, res, next){
    const openid = url.parse(req.query.origin || '', true).query.openid

    //后期需要对不同用户进行鉴权
    //用户
    console.log(req.session.username)
    if(req.session.username){
      console.log(req.session.username)
    }
    //用户的用户
    else if (!req.session.openid || !openid || req.session.openid !== openid) {
      return res.sendStatus(403)
    }
    next()
  }
}