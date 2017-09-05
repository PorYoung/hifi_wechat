const database = require("../model/database")
const ejs = require('ejs')
const fs = require('fs')
function allChatCtl(allChat,socket){
    socket.on("notification",async (msg)=>{
        //连接成功，将连接用户放入连接列表
        socket.nickname = msg.from;
        let info = await database.connection.findOneAndUpdate({"nickname":msg.from},{$set:{socketId:socket.id}},{upsert:false,new:true})
        socket.emit("notification",{content:"welcome to allChat",date:new Date().getTime()})
    })
    socket.on("public_message",async (msg)=>{
        //查找并为消息添加用户头像
        let info = await database.connection.findOne({nickname:msg.from},{_id:0,headimgurl:1})
        msg.headimgurl = info.headimgurl
        msg.date = new Date().getTime()
        //不必向用户自身发送
        socket.broadcast.emit("public_message",msg)
        //存储该消息
        await database.message.create(msg)
    });
    socket.on("disconnect",()=>{
        console.log(socket.nickname + "离开")
    })
}
//主程序
var allChat = async (ctx,next)=>{
    let userinfo = {}
    userinfo.openid = ctx.query.openid
    let html = ''
    //读取数据库
    userinfo = await database.connection.findOne({openid: userinfo.openid})
    function readFileAsync(dir){
        return new Promise((resolve,reject)=>{
            fs.readFile(dir,(err,file)=>{
                if(err) reject(err)
                else resolve(file)
            })
        })
    }
    //存在该用户
    if(userinfo){
        //呈递程序页面 nickname,headimgurl
        await readFileAsync(__dirname + '/../views/allChat.ejs').then((file)=>{
            file = file.toString()
            let compiled = ejs.compile(file)
            html = compiled({nickname:userinfo.nickname,headimgurl:userinfo.headimgurl})
        }).catch(err=>console.log(err))
        ctx.body = html
    }else{
        //返回错误:重新登录
        ctx.body = `<h1 style="text-align:center">userinfo</h1>
        <div style="text-align:center;font-size:32px;">
            <p>用户信息验证失败，请重新登录</p>
        </div>`
    }
}
var getmessage = async (ctx,next)=>{
    let status = ''
    let page = ctx.query.page
    if(page){
        function findByPaginationAsync(page){
            return new Promise((resolve,reject)=>{
                require("../model/getMessage.js").findByPagination({},8,ctx.query.page,function(err,data){
                    if(err) reject(err)
                    if(!data || data.length <= 0){
                        reject('-1')
                    }else {
                        resolve(data)
                    }
            })
        })
    }
    await findByPaginationAsync(page).then((data)=>{
        status = data
    }).catch(err=>status=err)
    }else{
        status = '-1'
    }
    ctx.body = status
}

module.exports= {
    allChatCtl: allChatCtl,
    'GET /allChat': allChat,
    'GET /allChat/getmessage': getmessage

}