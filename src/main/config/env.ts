import 'dotenv/config'

export default {
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017/authentication-api',
  port: process.env.PORT ?? 3000,
  secret: process.env.SECRET,
  smtpHost: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
  smtpPort: process.env.SMTP_PORT as unknown as number ?? 587,
  smtpUser: process.env.SMTP_USER ?? 'hassan.schmitt61@ethereal.email',
  smtpPass: process.env.SMTP_PASS ?? 'x3UbzsQPyR5M6wfA4d'
}
