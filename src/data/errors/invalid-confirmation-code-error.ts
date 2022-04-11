export class InvalidConfirmationCodeError extends Error {
  constructor (message: string) {
    super(message)
    super.name = 'InvalidConfirmationCodeError'
  }
}
