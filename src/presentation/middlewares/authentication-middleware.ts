import { serverError, unauthenticated } from '../helpers/http-helper'
import { HttpRequest, HttpResponse } from '../protocols'
import { Middleware } from '../protocols/middleware'
import { TokenValidator } from '../protocols/token-validator'

export class AuthenticationMiddleware implements Middleware {
  private readonly tokenValidator: TokenValidator

  constructor (tokenValidator: TokenValidator) {
    this.tokenValidator = tokenValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      if (!httpRequest.token) {
        return unauthenticated()
      }

      const token = httpRequest.token.split(' ')[1]

      const isTokenValid = await this.tokenValidator.verify(token)

      if (!isTokenValid) {
        return unauthenticated()
      }
    } catch (error) {
      return serverError()
    }
  }
}
