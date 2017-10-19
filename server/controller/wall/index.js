import db from '../../common/mongoose'
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
        let wall = await db.wall.findOne({username:info.username},{guests:1,_id:0})
        if(!wall.guests || wall.guests.length == 0) return res.send('-1')
        res.send(wall)
    }

    static async saveGuests(req,res,next){
        let info = req.body
        if(!info || !info.username) return res.send('-1')

    }

    static async uploadAvatar(req,res,next){
        console.log(req.body)
        res.send('1')
    }
}
