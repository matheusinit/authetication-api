import { ActivateAccount } from '../../../domain/usecases/activate-account'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'

export class ActivateAccountController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly activateAccount: ActivateAccount

  constructor (emailValidator: EmailValidator, activateAccount: ActivateAccount) {
    this.emailValidator = emailValidator
    this.activateAccount = activateAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, code } = httpRequest.body

      if (!email) {
        return badRequest(new MissingParamError('email'))
      }
      if (!code) {
        return badRequest(new MissingParamError('confirmation code'))
      }

      const isValid = this.emailValidator.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.activateAccount.activate({ email, confirmationCode: code })

      return ok(account)
    } catch (error) {
      return serverError()
    }
  }
}
