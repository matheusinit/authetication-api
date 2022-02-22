export class MissingParamError extends Error {
  constructor (paramName: string) {
    super(`Expecting param: ${paramName}`)
    this.name = 'MissingParamError'
  }
}
