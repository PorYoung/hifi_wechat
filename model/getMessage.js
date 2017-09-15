/**
 * @param from
 * @param count
 * @param page
 */
const findByPagination = async (criterion, limit, page, callback) => {
    db.message
        .where(criterion)
        .count(function (err, total) {
            //总页数从，0开始
            const totalPageNum = parseInt(total / limit);
            // 超过总页数则返回null
            if (page > totalPageNum) {
                callback(err, null)
            } else {
                const start = limit * page
                db.message
                    .where(criterion)
                    .sort({ date: -1 })
                    .limit(limit)
                    .skip(start)
                    .exec(callback)
            }
        })
}

export default {
    findByPagination
}