const fs = require('fs');

//读取controller文件夹中的js文件
function addControllers(router,dir){
    var files = fs.readdirSync(__dirname+dir);
    //过滤非js文件
    files = files.filter((file) => {
        return file.endsWith('.js')&&file!='index.js';
    })
    for(file of files){
        let mapping = require(__dirname+'/'+file);
        addRouters(router,mapping);
    }
}

//为url添加路由
function addRouters(router,mapping){
    for(var url in mapping){
        if(url.startsWith('GET ')){
            path = url.substring(4);
            router.get(path,mapping[url]);
        }else if(url.startsWith('POST ')){         
            path = url.substring(5);   
            router.post(path,mapping[url]);
        }
    }
}

module.exports = function(dir){
    let read_dir = dir || '';
    router = require('koa-router')();
    addControllers(router,read_dir);
    return router.routes();
};