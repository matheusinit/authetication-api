import { AuthAccount } from '../../../domain/usecases/auth-account'
import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoginController implements Controller {
  private readonly authAccount: AuthAccount

  constructor (authAccount: AuthAccount) {
    this.authAccount = authAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return badRequest(new MissingParamError('email'))
      }

      if (!password) {
        return badRequest(new MissingParamError('password'))
      }

      const session = await this.authAccount.auth({ email, password })

      return ok(session)
    } catch (error) {
      return serverError()
    }
  }
}
