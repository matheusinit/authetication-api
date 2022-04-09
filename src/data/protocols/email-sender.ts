export interface EmailContent {
  to: string
  from: string
  subject: string
  data: any
}

export interface EmailSender {
  sendEmail: (content: EmailContent) => Promise<void>
}
