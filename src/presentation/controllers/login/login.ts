import { AuthAccount } from '../../../domain/usecases/auth-account'
import { MissingParamError } from '../../errors'
import { badRequest, ok } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoginController implements Controller {
  private readonly authAccount: AuthAccount

  constructor (authAccount: AuthAccount) {
    this.authAccount = authAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return badRequest(new MissingParamError('email'))
    }

    if (!httpRequest.body.password) {
      return badRequest(new MissingParamError('password'))
    }

    await this.authAccount.auth({
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })

    return ok('')
  }
}
