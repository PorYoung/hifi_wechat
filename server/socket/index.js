import utils from '../common/utils'
const handle = socket => {
  socket.on("notification", async(msg) => {
      //连接成功，将连接用户放入连接列表
      socket.nickname = msg.from;
      let info = await db.connection.findOneAndUpdate({
          "nickname": msg.from,
          "headimgurl": msg.headimgurl
      }, {
          $set: {
              socketId: socket.id
          }
      }, {
          upsert: false,
          new: true
      })
      socket.emit("notification", {
          content: "welcome to allChat",
          date: new Date().getTime()
      })
  })
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
          let filename = msg.mediaId + '.jpg'
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
  socket.on("disconnect", () => {
      console.log(socket.nickname + "离开")
  })
}

export default {
    handle
}