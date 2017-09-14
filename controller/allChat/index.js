const koaRouter = require('koa-router') 
const router = koaRouter()

const getMessage = require("../../model/getMessage.js")
//主程序
const allchat = async(ctx, next) => {
  //读取数据库
  let userinfo = await db.connection.findOne({
      openid: ctx.query.openid
  })
  //存在该用户
  if (userinfo) {
      await ctx.render('allChat', {
          nickname: userinfo.nickname,
          headimgurl: userinfo.headimgurl
      })
  } else {
      //返回错误:重新登录
      ctx.body = `<h1 style="text-align:center">userinfo</h1>
      <div style="text-align:center;font-size:32px;">
          <p>用户信息验证失败，请重新登录</p>
      </div>`
  }
}

const getmessage = async(ctx, next) => {
    let status = ''
    let page = ctx.query.page
    if (page) {
        const findByPaginationAsync = page => {
            return new Promise((resolve, reject) => {
                getMessage.findByPagination({}, 8, ctx.query.page, function (err, data) {
                    if (err) reject(err)
                    if (!data || data.length <= 0) {
                        reject('-1')
                    } else {
                        resolve(data)
                    }
                })
            })
        }
        await findByPaginationAsync(page)
            .then((data) => {
                status = data
            })
            .catch(err => status = err)
    } else {
        status = '-1'
    }
    console.log(status)
    ctx.body = status
}

router
    .get('/allChat', allchat)
    .get('/allChat/getmessage', getmessage)

module.exports = router