import express from 'express'
import Wall from '../../../controller/wall'
import Permission from '../../../controller/permission'
const router = express.Router()

router
.get('/wall/guests',Permission.loginRequire,Wall.getGuests)
.post('/wall/guests',Permission.loginRequire,Wall.saveGuests)
.post('/wall/uploadAvatar',Permission.loginRequire,Wall.uploadAvatar)

export default router