import utils from '../common/utils'
const handle = socket => {
    //系统通知
    socket.on("notification", async(msg) => {
        //连接成功，将连接用户放入连接列表
        socket.nickname = msg.from;
        if(!!msg.username){
            let info = await db.user.findOneAndUpdate({
                "username": msg.username
            },{
                $set:{
                    socketId: socket.id
                }
            },{
                upsert: false,
                new: true
            })
        }else{
            let info = await db.connection.findOneAndUpdate({
                "nickname": msg.from,
                "openid": msg.openid
            }, {
                $set: {
                    socketId: socket.id
                }
            }, {
                upsert: true,
                new: true
            })
        }
        socket.emit("notification", {
            content: "welcome to allChat",
            date: new Date().getTime()
        })
    })
    //公共消息
    socket.on("public_message", async(msg) => {
        //查找并为消息添加用户头像
        let info = await db.connection.findOne({
            "nickname": msg.from
        }, {
            _id: 0,
            headimgurl: 1
        })
        msg.headimgurl = info.headimgurl
        msg.date = new Date().getTime()
        //如果是图片消息则向微信获取临时素材
        if(!!msg.MsgType && msg.MsgType == 'image'){
            let access_token = await utils.readFileSync('/../../access_token.txt').catch(err => 
            console.log(err)
            )
            try {
            access_token = JSON.parse(access_token.toString())
            access_token = access_token.access_token
            } catch (error) {
            console.log(error)
            }
            let url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${access_token}&media_id=${msg.mediaId}`
            let filename = '/image/message/' + msg.mediaId + '.jpg'
            let src = await utils.httpsGetFile(url,filename).catch(err => {
                console.log(err)
                socket.emit("notification", {
                content: "抱歉，上传失败",
                date: new Date().getTime()
                })
            })
            if(!src.indexOf('undefined')||!src.indexOf('weixin://')){
            socket.emit("notification", {
                content: "抱歉，上传失败",
                date: new Date().getTime()
                })
            }
            msg.mediaId = src
        }
        //不必向用户自身发送
        socket.broadcast.emit("public_message", msg)
        //存储该消息
        await db.message.create(msg)
    })
    //主持广播
    socket.on("host",async(msg) => {
        let info = await db.user.findOne({"username":msg.from},{_id:0,socketId:1})
        let socketId = info.socketId
        socket.broadcast.to(socketId).emit("host",msg)
        //存储该消息
        await db.message.create(msg)
    })
    //宾客功能大屏推送
    socket.on("guest",async(info) => {
        let user = await db.user.findOne({"username":info.username},{_id:0,socketId:1})
        let socketId = user.socketId
        socket.to(socketId).emit("guest",info)
    })
    //vote to the screen
    socket.on("switchVote",async(info) => {
        let query = null,
            user = await db.user.findOne({"username":info.username},{_id:0,socketId:1})
        if(info.type == "1"){
            query = await db.wall.findOne({username:info.username},{_id:0,activeVote:1})
            query = query.activeVote
        }
        let socketId = user.socketId
        socket.to(socketId).emit("switchVote",query)
    })
    //投票检查
    socket.on("vote_check",async(info) => {
        let connection =  await db.connection.findOne({$and:[{nickname:info.nickname},{openid:info.openid}]},{_id:0,vote:1,socketId:1})
        // let socketId = user.socketId
        if(!connection || !!connection.vote){
            socket.emit("vote_check",{res: "-1"})
        }else{
            socket.emit("vote_check",{res: "1"})
        }      
    })
    //投票
    socket.on("vote",async(vote) => {
        let arr = Object.keys(vote)
        let username = vote.username
        let voteId = vote.voteId
        for(var i = 0;i < arr.length;i++){
            if(arr[i] == "voteId" || arr[i] == "username" || arr[i] == "openid" || arr[i] == "nickname") continue
            let count = await db.wall.findOne({$and:[{username:username},{"activeVote.options":{$elemMatch:{id:vote[arr[i]]}}}]},{_id:0,"activeVote.options.$.count":1})
            count = !!count.activeVote.options[0].count ? parseInt(count.activeVote.options[0].count):0
            count++
            let info = await db.wall.findOneAndUpdate({$and:[{username:username},{"activeVote.options":{$elemMatch:{id:vote[arr[i]]}}}]},{$set:{"activeVote.options.$.count":count}})
        }
        let connection =  await db.connection.findOneAndUpdate({$and:[{nickname:vote.nickname},{openid:vote.openid}]},{$set:{vote:vote}})
        let res = await db.wall.findOne({username:username},{_id:0,activeVote:1})
        res = res.activeVote.options
        socket.broadcast.emit("vote",{res:res})
        socket.emit("vote",{res:res})
    })
    socket.on("disconnect", () => {
        console.log(socket.nickname + "离开")
    })
}

export default {
    handle
}