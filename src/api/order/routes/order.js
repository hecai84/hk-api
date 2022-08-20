module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/createOrder',
      handler: 'order.createOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/updateOrder',
      handler: 'order.updateOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/deleteOrder',
      handler: 'order.deleteOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/getOrder',
      handler: 'order.getOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/getOrders',
      handler: 'order.getOrders',
      config: {
        policies: [
          
        ],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/pickuppUpdateOrder',
      handler: 'order.pickuppUpdateOrder',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
