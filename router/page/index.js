import koaRouter from 'koa-router'

import AllChat from '../../controller/allChat'
import User from '../../controller/user'
import Wechat from '../../controller/wechat'

const router = new koaRouter()

router
  .get('/start', Wechat.start)
  .get('/allChat', AllChat.allchat)
  .get('/login', User.fn_login_index)
  .post('/login', User.fn_login)
  .get('/register', User.fn_regiter_index)
  .post('/register', User.fn_register)

export default router