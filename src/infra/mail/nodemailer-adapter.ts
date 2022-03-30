import nodemailer from 'nodemailer'
import { EmailSender } from '../../data/protocols/email-sender'
import env from '../../main/config/env'

export const smtpOptions = {
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'easter.willms17@ethereal.email',
    pass: 'F9ANt1zxbGcRkpkZA7'
  }
}

export class NodemailerAdapter implements EmailSender {
  async sendEmail (to: string, content: any): Promise<void> {
    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    })
    await transport.sendMail({
      from: 'Sender Name <sender@example.com>',
      to,
      subject: 'Authentication API - Código de confirmação',
      html: `<p><b>Authentication API</b> Código: ${content as string}</p>`
    })
  }
}
