export default class {
    static async fn_login(ctx, next) {
        let {username, password} = ctx.request.body
        if (username == "admin" && password == "1234") {
            ctx.response.body = "<h1>welcome" + username + "!</h1>"
        } else {
            ctx.response.body = "<h1>failed</h1>"
        }
    }
    static async fn_register(ctx, next) {
        let {username, password} = ctx.request.body
        if (!username || !password) {
            ctx.body = "-1"
        } else {
            ctx.body = "1"
        }
        console.log(username, password)
    }
    static async fn_regiter_index(ctx, next) {
        ctx.response.body = `<h1>Index</h1>
    <form action="/register" method="post">
        <p>Name: <input name="username" value="koa"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
    </form>`
    }
    static async fn_login_index(ctx, next) {
        ctx.response.body = `<h1>Index</h1>
    <form action="/login" method="post">
        <p>Name: <input name="username" value="admin"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
        <p><a href="/register">register</a></p>
    </form>`
    }
}