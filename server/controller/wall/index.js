export default class {
    static async wall(req,res,next){
        //权限判断
        if(!req.session.username){
            return res.redirect('/login')
        }else {
            //控制台 主页面渲染
            return res.render('console',{username:req.session.username})
        }
    }
    static async screen(req,res,next){
        //权限判断 + 是否已经启动
        if(!req.session.username) return res.redirect('../login')
        //读取用户设置参数，进行主页面渲染
        else {
            return res.render('screen')
        }
    }
}
