import env from './env/env.js'


export const config = {
  header: {},
  packetType: {},
  env: {
    port: env.PORT,
    host: env.HOST,
    clientVersion: env.CLIENT_VERSION,
    dbName: env.DB_NAME,
    dbUser: env.DB_USER,
    dbPassword: env.DB_PASSWORD,
    dbHost: env.DB_HOST,
    dbPort: env.DB_PORT,
    secretKey: env.SECRET_KEY,
  }
};
