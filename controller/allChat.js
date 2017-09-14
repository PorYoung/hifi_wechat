const database = require("../model/database")

function allChatCtl(allChat, socket){
    socket.on("notification", async (msg)=>{
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
var allChat = async (ctx, next) => {
    //读取数据库
    let userinfo = await database.connection.findOne({openid: ctx.query.openid})
    //存在该用户
    if(userinfo){
        await ctx.render('allChat', {nickname:userinfo.nickname,headimgurl:userinfo.headimgurl})
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
    }).catch(err => status=err)
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