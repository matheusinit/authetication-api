import { HttpRequest, HttpResponse } from '../protocols'
import { Middleware } from '../protocols/middleware'
import { TokenValidator } from '../protocols/token-validator'

export class AuthenticationMiddleware implements Middleware {
  private readonly tokenValidator: TokenValidator

  constructor (tokenValidator: TokenValidator) {
    this.tokenValidator = tokenValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    await this.tokenValidator.verify(httpRequest.token)
    return null
  }
}
