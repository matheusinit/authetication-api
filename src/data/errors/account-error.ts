export class AccountError extends Error {
  constructor (message: string, name: string) {
    super(message)
    super.name = name
  }
}
