import crypto from 'crypto'
export default class {
  static async fn_login(req, res) {
    let { username, password } = req.body
    //处理password
    const salt = crypto.createHash('md5').update(username).digest('hex').substr(6, 12)
    password = crypto.createHash('sha1').update(password).digest('hex')
    password = password.substr(0, 6) + salt + password.substr(-6)

    //查询数据库
    const userinfo = await db.user.findOne({ username: username })
    if (userinfo && userinfo.password === password) {
      //登陆成功
      req.session.username = username
      return res.send('1')
    } else {
      //登陆失败
      return res.send('-1')
    }
  }

  static async fn_register(req, res) {
    let { username, password } = req.body
    if (!username || !password) {
      return res.send('-1')
    } else {
      //检查用户名是否已存在
      let userinfo = await db.user.findOne({ username: username })
      if (userinfo) {
        //用户已存在
        return res.send('-2')
      } else {
        //处理password
        password = crypto.createHash('sha1').update(password).digest('hex')
        userinfo = await db.user.create({
          username: username,
          password: password.substr(0, 6) + crypto.createHash('md5').update(username).digest('hex').substr(6, 12) + password.substr(-6)
        })
        await db.wall.create({
          username: username
        })
        if (userinfo) {
          //注册成功
          req.session.username = userinfo.username
          return res.send('1')
        } else {
          //注册失败
          return res.send('-3')
        }
      }
    }
  }

  static async fn_check_username(req, res) {
    //接受用户名，查询数据库进行对比
    const username = req.query.username
    //查询数据库
    const msg = await db.user.findOne({ username: username })
    if (msg) {
      return res.send('-1')
    } else {
      return res.send('1')
    }
  }

  static async fn_regiter_index(req, res) {
    return res.render('register')
  }
  static async fn_login_index(req, res) {
    return res.render('login')
  }
}
