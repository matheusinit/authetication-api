export class PasswordNotMatchError extends Error {
  constructor () {
    super('Password not match')
    super.message = 'PasswordNotMatchError'
  }
}
