export class NotFoundError extends Error {
  constructor (param: string) {
    super(`Parameter not found: ${param}`)
    super.name = 'NotFoundError'
  }
}
