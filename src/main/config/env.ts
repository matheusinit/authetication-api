import 'dotenv/config'

export default {
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017/authentication-api',
  port: process.env.PORT ?? 3000,
  secret: process.env.SECRET
}
