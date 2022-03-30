import nodemailer from 'nodemailer'
import { EmailContent, EmailSender } from '../../data/protocols/email-sender'
import env from '../../main/config/env'

export class NodemailerAdapter implements EmailSender {
  async sendEmail (content: EmailContent): Promise<void> {
    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    })

    const { to, from, subject, html } = content

    await transport.sendMail({ to, from, subject, html })
  }
}
