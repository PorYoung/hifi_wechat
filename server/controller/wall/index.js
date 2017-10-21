import db from '../../common/mongoose'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
export default class {
    static async wall(req,res,next){
        //控制台 主页面渲染
        return res.render('console',{username:req.session.username})
    }
    static async screen(req,res,next){
        //读取用户设置参数，进行主页面渲染
        return res.render('screen')
    }

    static async getGuests(req,res,next){
        let username = req.query.username
        console.log(username)
        if(!username) return res.send('-1')
        let wall = await db.wall.findOne({username:username},{guests:1,_id:0})
        console.log(wall)
        if(!wall.guests || wall.guests.length == 0) return res.send('-1')
        return res.send(wall.guests)
    }

    static async saveGuests(req,res,next){
        let info = req.body
        if(!info || !info.username || !info.guestId || !info.name) return res.send('-1')
        if(!info.avatarSrc) info.avatar = '/static/image/avatar_default.jpg'
        let query = await db.wall.findOneAndUpdate({$and:[{username:info.username},{guests:{$elemMatch:{guestId:info.guestId}}}]},{$set:{"guests.$":info}},{upsert:false,new:true})
        if(!query) query = await db.wall.findOneAndUpdate({username:info.username},{$push:{guests:info}},{upsert:true,new:true})
        if(!query) return res.send('-1')
        return res.send('1')
    }

    static async uploadAvatar(req,res,next){
            // let date = new Date().getTime()
            let guestId = req.query.guestId
            console.log(guestId)
            let filename = 'guests_avatar_' + guestId  + '.png'
            let form = new formidable.IncomingForm()
            form.uploadDir = path.join(__dirname,'/../../../static/image/guests')
            form.parse(req)
            form.on('fileBegin',(name,file) => {
                file.name = filename
                file.path = path.join(__dirname,'/../../../static/image/guests/') + filename
            })
            form.on('end',() => {
                return res.send('/static/image/guests/'+filename)
            })
            form.on('error', (err) => {
                return res.send('-1')
            });
    }
}
