import nodemailer from 'nodemailer'
import { EmailContent, EmailSender } from '../../data/protocols/email-sender'
import env from '../../main/config/env'
import { TemplateRenderer } from './protocols/template-renderer'

export class NodemailerAdapter implements EmailSender {
  private readonly templateRenderer: TemplateRenderer

  constructor (templateRenderer: TemplateRenderer) {
    this.templateRenderer = templateRenderer
  }

  async sendEmail (content: EmailContent): Promise<void> {
    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    })

    const { to, from, subject, data } = content

    const html = this.templateRenderer.render('mail', data)

    await transport.sendMail({ to, from, subject, html })
  }
}
