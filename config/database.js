module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '101.32.207.71'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'logflows'),
      user: env('DATABASE_USERNAME', 'logflows'),
      password: env('DATABASE_PASSWORD', 'p3ciNRtnw8aA2p4s'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
