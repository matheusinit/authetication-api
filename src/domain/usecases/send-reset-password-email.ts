export interface SendResetPasswordEmail {
  send: (email: string) => Promise<void>
}
