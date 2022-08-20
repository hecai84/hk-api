'use strict';

let { axios } = require('../../helper/axios')
let { mylog, updateLog } = require('../../helper/log')


module.exports = {
  // logflows tms request this api to create order
  createOrder: async (ctx, next) => {
    try {
      //D0.记录日志
      const log = {
        shipref: ctx.request.body.shipref, action: 'create', from: 'logflows', to: 'pickupp',
        from_time: new Date(),
        from_header: ctx.request.headers, from_body: ctx.request.body,
        compid: ctx.state.user.compid, position: 'logflows To connector'
      }
      const logResult = await mylog(log)

      //D1.写入数据库order表和waypoint表
      var date = new Date()
      var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + date.getHours() + ':' + date.getMinutes + ':' + date.getSeconds
      var data = {
        "compid": ctx.request.body.compid,
        "shipref": ctx.request.body.shipref,
        "secondref": ctx.request.body.secondref,
        "remarks": ctx.request.body.remarks,
        "gw": ctx.request.body.gw,
        "gwunit": ctx.request.body.gwunit,
        "label": ctx.request.body.label,
        "totalqty": ctx.request.body.totalqty,
        "created_at": dateStr,
        "created_by_id": ctx.state.user.id,
        "updated_by_id": ctx.state.user.id,
        "waypoints": ctx.request.body.waypoints
      }


      var order = await strapi.db.query('api::order.order').create({
        data: data,
      });
      //D2.向pickupp调用createPickuppOrder接口
      var service_time = -1
      switch (ctx.state.user.service_type) {
        case 'four_hours':
        case 'same_day':
        case 'exchange':
          service_time = -1
          break;
        case 'express':
        case 'next_day':
        case 'collection':
          service_time = ctx.state.user.service_time
          break;
      }
      // 时间格式处理
      const regionResult = await strapi.db.query('api::region.region').findOne(
        {
          select: ['*'],
          where: { region_short: ctx.state.user.region.replace("'", '').replace("'", '') }
        });

      console.log('here1', ctx.state.user.region.replace("'", '').replace("'", ''))
      console.log('here1.5', regionResult)
      var pickup_time = ctx.request.body.waypoints[0].datetimeto
      console.log('here2')
      var tmp = pickup_time.split(' ')
      console.log('here2.1')
      pickup_time = tmp[0] + ' ' + regionResult.time
      console.log('here2.2')
      // pickup_time = tmp[0] + 'T' + regionResult
      console.log('here2 pickup_time', pickup_time)

      var body = {
        "pickup_contact_person": ctx.request.body.waypoints[0].companyname,
        "pickup_contact_phone": ctx.request.body.waypoints[0].phone,
        "pickup_address_line_1": ctx.request.body.waypoints[0].address,
        "pickup_time": pickup_time,
        "pickup_latitude": ctx.request.body.waypoints[0].lat,
        "pickup_longitude": ctx.request.body.waypoints[0].lng,

        "dropoff_contact_person": ctx.request.body.waypoints[1].contactperson,
        "dropoff_contact_phone": ctx.request.body.waypoints[1].phone,
        "dropoff_address_line_1": ctx.request.body.waypoints[1].address,
        "dropoff_latitude": ctx.request.body.waypoints[1].lat,
        "dropoff_longitude": ctx.request.body.waypoints[1].lng,
        "dropoff_notes": ctx.request.body.remarks,

        "region": ctx.state.user.region,// 从请求接口用户来
        "weight": ctx.request.body.gw,
        "origin": "API",
        "client_reference_number": ctx.request.body.shipref,
        "enforce_validation": true,
        "has_delivery_note": false,
        "service_type": ctx.state.user.service_type,  //service_type,// 从请求接口用户来
        "service_time": service_time, //service_time // 从请求接口用户来
      }

      //D2.向pickupp调用createOrder接口
      try {
        let res = await axios('POST', '/merchant/orders/single', body)
        if (res.status != 201) {
          console.log(0)
          var updateLogResult = await updateLog({ id: logResult.id }, {
            position: 'connector To pickupp',
            msg: res.response.data.meta.error_message,
            to_body: {
              method: 'POST',
              path: '/merchant/orders/single',
              body: body
            }
          })
          ctx.body = res.response.data.meta.error_message;
        } else {
          //D3.更新订单pickupp的订单号id 更新日志记录状态，说明已完成推送
          console.log('成功', res.data.data.id)
          const updateOrder = await strapi.query('api::order.order').update({
            where: { id: order.id }, data: {
              pickupp_order_id: res.data.data.id
            }
          })
          ctx.body = updateOrder;
        }
      } catch (error) {
        var updateLogResult = await updateLog({ id: logResult.id }, {
          position: 'connector To pickupp',
          msg: JSON.stringify(error),
          to_body: {
            method: 'POST',
            path: '/merchant/orders/single',
            body: body
          }
        })
        console.log(1)
        ctx.body = err;
      }
    } catch (err) {
      //D3.异常则进行下一次的间隔时间调用
      // ctx.body='test'
      console.log(2)
      ctx.body = err;
    }
  },
  // logflows tms request this api to create order
  updateOrder: async (ctx, next) => {
    try {
      //D0.记录日志
      const log = {
        shipref: ctx.request.body.shipref, action: 'update', from: 'logflows', to: 'pickupp',
        from_time: new Date(),
        from_header: ctx.request.headers, from_body: ctx.request.body,
        compid: ctx.state.user.compid, position: 'logflows To connector'
      }
      const logResult = await mylog(log)
      //D1.写入数据库order表和waypoint表
      let data = {
        "compid": ctx.request.body.compid,
        "shipref": ctx.request.body.shipref,
        "secondref": ctx.request.body.secondref,
        "remarks": ctx.request.body.remarks,
        "gw": ctx.request.body.gw,
        "gwunit": ctx.request.body.gwunit,
        "label": ctx.request.body.label,
        "totalqty": ctx.request.body.totalqty,
        "created_by_id": ctx.state.user.id,
        "updated_by_id": ctx.state.user.id,
      }

      var updateOrder = await strapi.query('api::order.order').update({
        where: { id: ctx.request.body.id }, data: data
      })
      console.log('resultOrder', updateOrder)
      //D2.向pickupp调用updateOrder接口
      let path = '/merchant/orders/' + updateOrder.pickupp_order_id
      let method = 'PUT'
      try {
        var body = {
          "pickup_contact_person": ctx.request.body.waypoints[0].companyname,
          "pickup_contact_phone": ctx.request.body.waypoints[0].phone,
          "pickup_notes": ctx.request.body.waypoints[0].pickup_notes,
          "dropoff_contact_person": ctx.request.body.waypoints[1].contactperson,
          "dropoff_contact_phone": ctx.request.body.waypoints[1].phone,
          "dropoff_notes": ctx.request.body.waypoints[1].dropoff_notes
        }
        let res = await axios(method, path, body)
        console.log('res', res)
        if (res.status != 200) {
          var updateLogResult = await updateLog({ id: logResult.id }, {
            position: 'connector To pickupp',
            msg: res.response.data.meta.error_message,
            to_body: {
              method: method,
              path: path,
              body: body
            }
          })
          ctx.body = res.response.data.meta.error_message;
        } else {
          //D3.更新记录到数据库，说明日志已完成推送
          ctx.body = updateOrder;
        }
      } catch (error) {
        var updateLogResult = await updateLog({ id: logResult.id }, {
          position: 'connector To pickupp',
          msg: JSON.stringify(error),
          to_body: {
            method: method,
            path: path,
            body: body
          }
        })
        console.log(1)
        ctx.body = error
      }
    } catch (err) {
      //D3.异常则进行下一次的间隔时间调用
      console.log(2)
      ctx.body = err;
    }
  },
  // logflows tms request this api to create order
  deleteOrder: async (ctx, next) => {
    try {
      //D0.记录日志
      const log = {
        shipref: ctx.request.body.shipref, action: 'delete',
        from: 'logflows', to: 'pickupp',
        from_time: new Date(),
        from_header: ctx.request.headers, from_body: ctx.request.body,
        compid: ctx.state.user.compid, position: 'logflows To connector'
      }
      const logResult = await mylog(log)
      //D1.删除order表和waypoint表对应记录
      const deleteResult = await strapi.db.query('api::order.order').delete({ where: { shipref: ctx.request.body.shipref } });
      console.log('deleteResult', deleteResult)
      if (deleteResult != null) {
        let path = '/merchant/orders/' + deleteResult.pickupp_order_id
        let method = 'DELETE'
        try {
          let res = await axios(method, path, {})
          console.log('res', res)
          if (res.status != 200) {
            var updateLogResult = await updateLog({ id: logResult.id }, {
              position: 'connector To pickupp',
              msg: res.data.meta.error_message,
              to_body: {
                method: method,
                path: path,
                body: body
              }
            })
            ctx.body = res.data.meta.error_message;
          } else {
            //D3.更新记录到数据库，说明日志已完成推送
            ctx.body = deleteResult;
          }
        } catch (error) {
          var updateLogResult = await updateLog({ id: logResult.id }, {
            position: 'connector To pickupp',
            msg: JSON.stringify(error),
            to_body: {
              method: 'DELETE',
              path: path,
              body: {}
            }
          })
          ctx.body = error;
        }
      }
    } catch (err) {
      //D3.异常则进行下一次的间隔时间调用
      ctx.body = err;
    }
  },
  // logflows tms request this api to create order
  getOrder: async (ctx, next) => {
    try {
      const { shipref } = ctx.query;
      //D0.获取order表和waypoint表对应记录
      const result = await strapi.db.query('api::order.order').findOne(
        {
          select: ['*'],
          where: { shipref: shipref }
        });
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
    }
  },
  // logflows tms request this api to create order
  getOrders: async (ctx, next) => {
    try {
      //D0.获取order表列表数据和waypoint表对应记录
      const entries = await strapi.db.query('api::order.order').findMany({
        select: ['*'],
        where: {},
        orderBy: { publishedAt: 'DESC' },
        limit: 10
      });

      ctx.body = entries
    } catch (err) {
      ctx.body = err;
    }
  },
  //pickup update order and req this, such as status update,common status,other statuses
  //pickupp向系统推送status状态值
  //For simple validation that the request is from Pickupp server, we added Pickupp-Origin: 1 in the request header.
  pickuppUpdateOrder: async (ctx, next) => {
    try {
      const log = {
        shipref: ctx.request.body.client_reference_number, action: 'pickupp update status',
        from: 'pickupp', to: 'logflows',
        from_time: new Date(),
        from_header: ctx.request.headers, from_body: ctx.request.body,
        compid: 0, position: 'pickupp To connector'
      }
      var logResult = await mylog(log)
      console.log('logResult', logResult)
      var headers = ctx.request.header
      if (headers['pickupp-origin'] == 1) {
        //D0.日志记录
        //D1.更新order记录
        var data = {
          attempts: ctx.request.body.attempts,
          pickup_attempts: ctx.request.body.pickup_attempts,
          dropoff_attempts: ctx.request.body.dropoff_attempts,
          signature_url: ctx.request.body.signature_url,
          delivery_agent_location: ctx.request.body.delivery_agent_location,
          tracking_url: ctx.request.body.tracking_url,
          cancel_reason_type: ctx.request.body.cancel_reason_type,
          warehouse_id: ctx.request.body.warehouse_id,
          location_barcode: ctx.request.body.location_barcode,
          trip_dropoff_address: ctx.request.body.trip_dropoff_address,
          delivery_agent_name: ctx.request.body.delivery_agent_name,
          delivery_agent_phone: ctx.request.body.delivery_agent_phone,
          reschedule_url: ctx.request.body.reschedule_url,
          detail_reason: ctx.request.body.detail_reason,
          status: ctx.request.body.status,
          unable_to_deliver_reason:ctx.request.body.unable_to_deliver_reason
        }
        console.log('order start')
        var resultOrder = await strapi.query('api::order.order').updateMany(
          {
            where: { shipref: ctx.request.body.client_reference_number },
            data: data
          });
        console.log('order end')
        ctx.body = resultOrder;
      } else {
        throw Error("illegle");
      }
    } catch (err) {
      // var updateLogResult = await updateLog({ id: logResult.id }, {
      //   position: 'connector To pickupp',
      //   msg: JSON.stringify(error)
      // })
      console.log('err', err)
      ctx.body = err;
    }
  }
};