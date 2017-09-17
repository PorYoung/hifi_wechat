export default class {
    static async fn_login(req, res, next) {
        let {username, password} = req.body
        if (username == "admin" && password == "1234") {
            return res.send("<h1>welcome" + username + "!</h1>")
        } else {
            return res.send("<h1>failed</h1>")
        }
    }
    static async fn_register(req, res, next) {
        let {username, password} = req.body
        if (!username || !password) {
            res.send("-1")
        } else {
            res.send("1")
        }
        console.log(username, password)
    }
    static async fn_regiter_index(req, res, next) {
        return res.send(`<h1>Index</h1>
    <form action="/register" method="post">
        <p>Name: <input name="username" value="koa"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
    </form>`)
    }
    static async fn_login_index(req, res, next) {
        return res.send(`<h1>Index</h1>
    <form action="/login" method="post">
        <p>Name: <input name="username" value="admin"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
        <p><a href="/register">register</a></p>
    </form>`)
    }
}