var fn_login = async (ctx,next) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password;
    if(username == "admin" && password == "1234"){
        ctx.response.body = "<h1>welcome"+username+"!</h1>";
    }else{
        ctx.response.body = "<h1>failed</h1>";
    }
}
var fn_register = async (ctx,next) => {
    let username = ctx.request.body.username,
        password = ctx.request.body.password;
    if(!username || !password){
        ctx.body = "-1";
    }else{
        ctx.body = "1";
    }
    console.log(username,password);
}
var fn_regiter_index = async (ctx,next) => {
    ctx.response.body = `<h1>Index</h1>
    <form action="/register" method="post">
        <p>Name: <input name="username" value="koa"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
    </form>`;
}
var fn_login_index = async (ctx,next) => {
    ctx.response.body = `<h1>Index</h1>
    <form action="/login" method="post">
        <p>Name: <input name="username" value="admin"></p>
        <p>Password: <input name="password" type="password"></p>
        <p><input type="submit" value="Submit"></p>
        <p><a href="/register">register</a></p>
    </form>`;
}

module.exports = {
    "POST /login" : fn_login,
    "POST /register" : fn_register,
    "GET /register" : fn_regiter_index,
    "GET /login" : fn_login_index
}

