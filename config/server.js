module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks:{
    defaultHeaders: {
      'Custom-Header': 'my-custom-header',
      'Authorization': 'Bearer my-very-secured-token'
    },
  }
});
