const handle = socket => {
  socket.on("notification", async(msg) => {
      //连接成功，将连接用户放入连接列表
      socket.nickname = msg.from;
      let info = await db.connection.findOneAndUpdate({
          "nickname": msg.from
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
      //不必向用户自身发送
      socket.broadcast.emit("public_message", msg)
      //存储该消息
      await db.message.create(msg)
  })
  socket.on("disconnect", () => {
      console.log(socket.nickname + "离开")
  })
}

module.exports = {
  handle
}