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

    static async getFlags(req,res,next){
        let username = req.query.username
        let wall = await db.wall.findOne({username:username},{flags:1,_id:0})
        if(!wall.flags) return res.send('-1')
        return res.send(wall.flags)
    }

    static async setFlags(req,res,next){
        let info = req.body
        if(!info || !info.username) return res.send('-1')
        if(info.flag.hasOwnProperty('guests')){
            let flag = info.flag.guests
            let data = await db.wall.findOneAndUpdate({username:info.username},{$set:{flags:{guests:flag}}},{upsert:false,new:true})
            if(!data) return res.send('-1')
        }
        else if(info.flag.hasOwnProperty('vote')){
            let flag = info.flag.vote
            let data = await db.wall.findOneAndUpdate({username:info.username},{$set:{flags:{vote:flag}}},{upsert:false,new:true})
            if(!data) return res.send('-1')
        }
        else if(info.flag.hasOwnProperty('lottery')){
            let flag = info.flag.lottery
            let data = await db.wall.findOneAndUpdate({username:info.username},{$set:{flags:{lottery:flag}}},{upsert:false,new:true})
            if(!data) return res.send('-1')
        }
        return res.send('1')
    }

    static async getGuests(req,res,next){
        let username = req.query.username
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
            })
    }

    static async uploadOptionsImage(req,res,next){
        let optionsId = req.query.optionsId
        if(!optionsId) return res.send('-1')
        let filename = 'options_image_' + optionsId + '.png'
        let form = new formidable.IncomingForm()
        form.uploadDir = path.join(__dirname,'../../../static/image/wall')
        form.parse(req)
        form.on('fileBegin',(name,file) => {
            file.name = filename
            file.path = path.join(__dirname,'../../../static/image/wall/') + filename
        })
        form.on('end',() => {
            return res.send('/static/image/wall/' + filename)
        })
        form.on('err',()=>{
            return res.send('-1')
        })    
    }

    static async getVotes(req,res,next){
        let username = req.query.username
        let wall = await db.wall.findOne({username:username},{votes:1,_id:0})
        if(!wall.votes || wall.votes.length == 0) return res.send('-1')
        return res.send(wall.votes)
    }
    static async saveVote(req,res,next){
        let vote = req.body
        if(!vote || !vote.username || !vote.voteId || !vote.title) return res.send('-1')
        let query = await db.wall.findOneAndUpdate({$and:[{username:vote.username},{votes:{$elemMatch:{voteId:vote.voteId}}}]},{$set:{"votes.$":vote}},{upsert:false,new:true})
        if(!query) query = await db.wall.findOneAndUpdate({username:vote.username},{$push:{votes:vote}},{upsert:false,new:true})
        if(!query) return res.send('-1')
        return res.send('1')
    }

    static async deleteVote(req,res,next){
        let info = req.body
        if(!info || !info.username || !info.voteId) return res.send('-1')
        let query = await db.wall.findOne({$and:[{username:info.username},{votes:{$elemMatch:{voteId:info.voteId}}}]},{'votes.$':1,_id:0})
        if(!query || !query.votes[0]) return res.send('1')
        let options = query.votes[0].options
        var syncUnlink = function(file){
            return new Promise((resolve,reject) => {
                fs.unlink(file,(err) => {
                    if(err) reject(err)
                    resolve('1')
                })
            })
        }
        for(var i in options){
            if(options.hasOwnProperty(i) && !!options[i].imgSrc){
               /*  fs.unlink(path.join(__dirname,'/../../..' + options[i].imgSrc),(err)=>{
                    if(err) console.log(err)
                })  */
                await syncUnlink(path.join(__dirname,'/../../..' + options[i].imgSrc)).catch(err=>console.log(err))            
            }
        }
        query = await db.wall.findOneAndUpdate({username:info.username},{$pull:{votes:{voteId:info.voteId}}},{upsert:false,new:true})
        if(!query) return res.send('-1')
        return res.send('1')
    }

    static async switchVote(req,res,next){
        let vote = req.body
        if(!vote || !vote.username || !vote.voteId) return res.send('-1')
        if(vote.type == "1"){
            let query = await db.wall.findOne({$and:[{username:vote.username},{votes:{$elemMatch:{voteId:vote.voteId}}}]},{'votes.$':1,_id:0})
            if(!query) return res.send('-1')
            let activeVote = query.votes[0]
            query = await db.wall.findOneAndUpdate({username:vote.username},{$set:{activeVote:activeVote}},{upsert:false,new:true})
            if(!query) return res.send('-1')
            return res.send('1')
        }else if(vote.type == "0"){
            query = await db.wall.findOneAndUpdate({$and:[{username:vote.username},{activeVote:{voteId:vote.voteId}}]},{$set:{activeVote:null}},{upsert:false,new:true})
            if(!query) return res.send('-1')
            return res.send('1')
        }
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
