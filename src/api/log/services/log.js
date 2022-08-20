'use strict';

module.exports = {
    createLog: async () => {
        try {
            var arr = {
                action: data.action,
                status: data.status,
                state: data.state,
                from: data.from,
                to: data.to,
                raw: data.raw
            }
            return arr
        } catch (err) {
            return err;
        }
    }
}

// const { createCoreService } = require('@strapi/strapi').factories;
// module.exports = createCoreService('api::log.log', ({ strapi }) =>  ({
//     async createLog(data) {
//         var arr={
//             action:data.action,
//             status:data.status,
//             state:data.state,
//             from:data.from,
//             to:data.to,
//             raw:data.raw
//         }
//         return arr;
//         // const entry = await strapi.db.query('api::log.log').create({data:arr});
//         // return entry
//     },
// }));
