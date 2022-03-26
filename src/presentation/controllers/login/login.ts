import { EmailNotRegisteredError } from '../../../data/errors/email-not-registered-error'
import { PasswordNotMatchError } from '../../../data/errors/password-not-match-error'
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

      const token = await this.authAccount.auth({ email, password })

      return ok({ token })
    } catch (error) {
      if (error instanceof EmailNotRegisteredError) {
        return badRequest(error)
      } else if (error instanceof PasswordNotMatchError) {
        return badRequest(error)
      }

      return serverError()
    }
  }
}
