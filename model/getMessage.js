var database = require("./database");
/**
     * @param from
     * @param count
     * @param page
     */
async function findByPagination(criterion,limit,page,callback){
    database.message
        .where(criterion)
        .count(function(err,total){
            //总页数从，0开始
            var totalPageNum = parseInt(total/limit);
            // 超过总页数则返回null
            if(page > totalPageNum){
                callback(err,null);
            }else{
                var start = limit*page;
                database.message
                    .where(criterion)
                    .sort({date:-1})
                    .limit(limit)
                    .skip(start)
                    .exec(callback)
            }
        })   
    }
module.exports.findByPagination = findByPagination;