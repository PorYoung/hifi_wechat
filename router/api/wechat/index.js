import koaRouter from 'koa-router'
import Wechat from '../../../controller/wechat'

const router = new koaRouter()

router
    .get('/wechat', Wechat.get_wechat)
    .post('/wechat', Wechat.post_wechat)
    .get('/authorization', Wechat.userinfo_wechat)

export default router