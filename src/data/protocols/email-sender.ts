export interface EmailContent {
  to: string
  from: string
  subject: string
  data: any
}

export interface EmailSender {
  sendEmail: (template: string, content: EmailContent) => Promise<void>
}
