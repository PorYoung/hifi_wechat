import url from 'url'

export default class {
  static loginRequire(req, res, next){
    const openid = url.parse(req.query.origin || '', true).query.openid
    if (!req.session.openid || !openid || req.session.openid !== openid) {
      return res.sendStatus(403)
    }
    next()
  }
}