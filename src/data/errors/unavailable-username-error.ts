export class UnavailableUsernameError extends Error {
  constructor () {
    super('Unavailable username')
    this.name = 'UnavailableUsernameError'
  }
}
