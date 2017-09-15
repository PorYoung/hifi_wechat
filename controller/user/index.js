import koaRouter from 'koa-router'
const router = koaRouter()

const fn_login = async (ctx,next) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password;
    if(username == "admin" && password == "1234"){
        ctx.response.body = "<h1>welcome"+username+"!</h1>";
    }else{
        ctx.response.body = "<h1>failed</h1>";
    }
}
const fn_register = async (ctx,next) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password;
    if(!username || !password){
        ctx.body = "-1";
    }else{
        ctx.body = "1";
    }
    console.log(username, password);
}
const fn_regiter_index = async (ctx,next) => {
    ctx.response.body = `<h1>Index</h1>
    <form action="/register" method="post">
        <p>Name: <input name="username" value="koa"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
    </form>`;
}
const fn_login_index = async (ctx,next) => {
    ctx.response.body = `<h1>Index</h1>
    <form action="/login" method="post">
        <p>Name: <input name="username" value="admin"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
        <p><a href="/register">register</a></p>
    </form>`;
}

router
    .get('/login', fn_login_index)
    .post('/login', fn_login)
    .get('/register', fn_regiter_index)
    .post('/register', fn_register)

export default router
