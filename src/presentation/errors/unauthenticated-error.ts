export class UnauthenticatedError extends Error {
  constructor () {
    super('Unauthenticated')
    super.name = 'UnauthenticatedError'
  }
}
