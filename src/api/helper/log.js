module.exports = {
    mylog: async (log) => {
        try {
            var logResult = await strapi.db.query('api::log.log').create({
                data: log,
            });
            console.log('记录日志', logResult)
            return logResult
        } catch (error) {
            return error
        }
    },
    updateLog: async (where, log) => {
        try {
            var logResult = await strapi.db.query('api::log.log').update({ where: where, data: log });
            console.log('更新日志', logResult)
            return logResult
        } catch (error) {
            return error
        }
    },
}
