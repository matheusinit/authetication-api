export class UnavailableEmailError extends Error {
  constructor () {
    super('Already exists an account with this email')
    this.name = 'UnavailableEmailError'
  }
}
