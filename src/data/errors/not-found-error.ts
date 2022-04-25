export class NotFoundError extends Error {
  public readonly param: string

  constructor (param: string) {
    super(`Parameter not found: ${param}`)
    this.param = param
    super.name = 'NotFoundError'
  }
}
