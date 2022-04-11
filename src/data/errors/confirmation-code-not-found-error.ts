export class ConfirmationCodeNotFoundError extends Error {
  constructor () {
    super('Confirmation code not found')
    super.name = 'ConfirmationCodeNotFoundError'
  }
}
