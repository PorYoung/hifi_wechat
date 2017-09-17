import express from 'express'
import Wechat from '../../../controller/wechat'

const router = express.Router()

router
    .get('/wechat', Wechat.get_wechat)
    .post('/wechat', Wechat.post_wechat)
    .get('/authorization', Wechat.authorization)

export default router