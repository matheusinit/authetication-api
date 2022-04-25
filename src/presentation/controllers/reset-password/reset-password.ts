import { AccountError } from '../../../data/errors/account-error'
import { NotFoundError } from '../../../data/errors/not-found-error'
import { ResetPassword } from '../../../domain/usecases/reset-password'
import { MissingParamError, InvalidParamError } from '../../errors'
import { badRequest, serverError, ok } from '../../helpers/http-helper'
import { Controller } from '../../protocols/controller'
import { HttpRequest, HttpResponse } from '../../protocols/http'
import { PasswordValidator } from '../../protocols/password-validator'

export class ResetPasswordController implements Controller {
  private readonly passwordValidator: PasswordValidator
  private readonly resetPassword: ResetPassword

  constructor (passwordValidator: PasswordValidator, resetPassword: ResetPassword) {
    this.passwordValidator = passwordValidator
    this.resetPassword = resetPassword
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { token, password, passwordConfirmation } = httpRequest.body

      const params = ['token', 'password', 'passwordConfirmation']

      for (const param of params) {
        if (!httpRequest.body[param]) {
          return badRequest(new MissingParamError(param))
        }
      }

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isPasswordValid = this.passwordValidator.isValid(password)

      if (!isPasswordValid) {
        return badRequest(new InvalidParamError('password'))
      }

      const account = await this.resetPassword.reset(token, password)

      return ok(account)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return badRequest(error)
      }

      if (error instanceof AccountError) {
        return badRequest(new AccountError('Account is inactive', 'AccountIsInactiveError'))
      }

      if (error instanceof InvalidParamError) {
        return badRequest(error)
      }

      return serverError()
    }
  }
}
