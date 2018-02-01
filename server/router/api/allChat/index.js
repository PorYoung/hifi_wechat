import express from 'express'
import Permission from '../../../controller/permission'
import AllChat from '../../../controller/allChat'

const router = express.Router()

router
  .get('/allChat/getMessage', Permission.loginRequire, AllChat.getmessage)

export default router
