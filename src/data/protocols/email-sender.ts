export interface EmailContent {
  to: string
  from: string
  subject: string
  html: string
}

export interface EmailSender {
  sendEmail: (content: EmailContent) => Promise<void>
}
