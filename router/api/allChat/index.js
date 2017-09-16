import koaRouter from 'koa-router'
import AllChat from '../../../controller/allChat'

const router = new koaRouter()

router
  .get('/allChat/getmessage', AllChat.getmessage)

export default router