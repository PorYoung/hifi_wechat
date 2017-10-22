import express from 'express'
import Wall from '../../../controller/wall'
import Permission from '../../../controller/permission'
import Wechat from '../../../controller/wechat'
const router = express.Router()

router
.get('/wall/guests',Permission.loginRequire,Wall.getGuests)
.get('/wall/QRSrc',Permission.loginRequire,Wall.getQRSrc,Wechat.getQR)
.post('/wall/deleteGuest',Permission.loginRequire,Wall.deleteGuest)
.post('/wall/guests',Permission.loginRequire,Wall.saveGuests)
.post('/wall/uploadAvatar',Permission.loginRequire,Wall.uploadAvatar)

export default router