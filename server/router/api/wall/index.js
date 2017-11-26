import express from 'express'
import Wall from '../../../controller/wall'
import Permission from '../../../controller/permission'
import Wechat from '../../../controller/wechat'
const router = express.Router()

router
.get('/wall/flags',Permission.loginRequire,Wall.getFlags)
.post('/wall/flags',Permission.loginRequire,Wall.setFlags)
.post('/wall/setUI',Permission.loginRequire,Wall.setUI)
.get('/wall/guests',Permission.loginRequire,Wall.getGuests)
.get('/wall/votes',Permission.loginRequire,Wall.getVotes)
.get('/wall/activeVote',Permission.loginRequire,Wall.getActiveVote)
.get('/wall/QRSrc',Permission.loginRequire,Wall.getQRSrc,Wechat.getQR)
.post('/wall/deleteGuest',Permission.loginRequire,Wall.deleteGuest)
.post('/wall/guests',Permission.loginRequire,Wall.saveGuests)
.post('/wall/uploadAvatar',Permission.loginRequire,Wall.uploadAvatar)
.post('/wall/optionsImage',Permission.loginRequire,Wall.uploadOptionsImage)
.post('/wall/votes',Permission.loginRequire,Wall.saveVote)
.post('/wall/switchVote',Permission.loginRequire,Wall.switchVote)
.post('/wall/deleteVote',Permission.loginRequire,Wall.deleteVote)

export default router