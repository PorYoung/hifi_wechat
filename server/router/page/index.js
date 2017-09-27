import express from 'express'

import AllChat from '../../controller/allChat'
import User from '../../controller/user'
import Wechat from '../../controller/wechat'
import Wall from  '../../controller/wall'

const router = express.Router()

router
  .get('/start', Wechat.start)
  .get('/allChat', AllChat.allchat)
  .get('/login', User.fn_login_index)
  .post('/login', User.fn_login)
  .get('/register', User.fn_regiter_index)
  .post('/register', User.fn_register)
  .get('/register/checkUsername', User.fn_check_username)
  .get('/wall',Wall.wall)
  .get('/wall/screen',Wall.screen)

export default router