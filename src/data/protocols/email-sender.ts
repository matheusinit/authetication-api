export interface EmailSender {
  sendEmail: (to: string, content: any) => Promise<void>
}
