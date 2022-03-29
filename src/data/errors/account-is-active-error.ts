export class AccountIsActiveError extends Error {
  constructor () {
    super('Account is already active')
    super.name = 'AccountIsActiveError'
  }
}
