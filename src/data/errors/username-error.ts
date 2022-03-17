export class UsernameError extends Error {
  constructor () {
    super('Unavailable username')
    this.name = 'UsernameError'
  }
}
