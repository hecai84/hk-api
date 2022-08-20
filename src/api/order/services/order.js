'use strict';
var querystring = require('querystring');
const { createCoreService } = require('@strapi/strapi').factories;

/**
 * order service.
 */
module.exports = createCoreService('api::restaurant.restaurant', ({ strapi }) =>  ({
    async deletePickuppOrder() {
        
    },
    async getPickuppOrder(order_id) {
        let path = '/merchant/orders/' + order_id + '?include_history=true'
        this.toReq(path, '', 'GET')
    },
    async updatePickuppOrder(data) {
        var body = {
            "pickup_contact_person": data.waypoints[0].companyname,
            "pickup_contact_phone":data.waypoints[0].phone,
            "pickup_notes": '',
            "dropoff_contact_person": data.waypoints[1].contactperson,
            "dropoff_contact_phone":data.waypoints[1].phone,
            "dropoff_notes": data.remarks
        }
        let path = '/merchant/orders/' + data.id
        this.toReq(path, body, 'PUT')
    },
    async createPickuppOrder(body) {
        let path = '/merchant/orders/single'
        this.toReq(path, body, 'POST')
        return "success";
    },
    async cancelPickuppOrder(order_id) {
        let path = '/merchant/orders/'+order_id
        this.toReq(path, body, 'DELETE')
        return "success";
    },
    async toReq(path, postData, method = 'POST') {
        // 封装HTTP请求的数据
        var postData = querystring.stringify(postData)
        // 设置HTTP请求选项
        var options = {
            host: 'gateway-uat.hk.pickupp.io/v2',
            path: path,
            method: method,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "application/json",
                "Authorization": "am9yZGFubGVlQGxvZ2Zsb3dzLmNvbTo5N2ZjZGE0Y2JlZGM4NGUxMTY1YWRjZWE4ZGVhYmQyMA=="
            }
        }

        // 发送HTTP请求
        var req = http.request(options, function (res) {
            var dataJSON;
            console.log('Got Response ：' + res.statusCode);
            res.on('data', function (d) {
                dataJSON = JSON.parse(d);
                console.warn(dataJSON);
            });
            res.on('end', function () {
                console.log('end')
                console.log(dataJSON)
            });
        });
        req.on('error', function (e) {
            // console.error('Got Error:' + e.message);
            ctx.render('signin-failed.html', {
                title: 'Sign In Failed'
            });
        });
        req.write(postData);
        req.end();
    }
}));
