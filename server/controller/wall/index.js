import db from '../../common/mongoose'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import utils from '../../common/utils'

export default class {
    static async wall(req,res,next){
        //控制台 主页面渲染
        return res.render('console',{username:req.session.username})
    }
    static async screen(req,res,next){
        //读取用户设置参数，进行主页面渲染
        return res.render('screen',{
            username:req.session.username
        })
    }

    static async getGuests(req,res,next){
        let username = req.query.username
        if(!username) return res.send('-1')
        let wall = await db.wall.findOne({username:username},{guests:1,_id:0})
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

    static async deleteGuest(req,res,next){
        let info = req.body
        if(!info || !info.guestId || !info.username) return res.send('-1')
        let query = await db.wall.findOneAndUpdate({username:info.username},{$pull:{guests:{guestId:info.guestId}}},{upsert:false,new:true})
        if(!query) return res.send('-1')
        fs.unlink(path.join(__dirname,'/../../..' + info.avatarSrc),(err)=>{
            if(err) console.log(err)
            return res.send('1')
        }) 
    }

    static async uploadAvatar(req,res,next){
            let guestId = req.query.guestId
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

    static async getQRSrc(req,res,next){
        let username = req.query.username
        if(!username) return res.send('-1')
        let query = await db.wall.findOne({username:username},{QRSrc:1,QRTicket:1,_id:0})
        function fsExistsSync(path) {
            try{
                fs.accessSync(path,fs.F_OK);
            }catch(e){
                return false;
            }
            return true;
        }
        async function getQRByTicket(){
            let url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURI(query.QRTicket)
            let filename = '/image/users/QR_' + username + '.jpg'
            let QRSrc = await utils.httpsGetFile(url,filename).catch(err => console.log(err))
            if(!QRSrc) return res.send('-2')
            query = await db.wall.findOneAndUpdate({username:username},{QRSrc:QRSrc},{upsert:false,new:true})
            if(!query) return res.send('-1')
            return res.send(QRSrc)
        }
        if(!!query.QRSrc){
            if(!fsExistsSync(path.join(__dirname,'../../../' + query.QRSrc))){
                if(!!query.QRTicket) getQRByTicket()
                else next()
            }else{
                return res.send(query.QRSrc)
            }
        }else if(!!query.QRTicket) getQRByTicket()
        else if(!query.QRSrc && !query.QRTicket) next()
    }
}
