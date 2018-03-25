export const config = {
  mongoURL : 'mongodb://localhost/Authentication',
  port: 3000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: 'authentication1122334411223344'
}

config.isDev = config.env === 'development';
