import { ResetPassword } from '../../../domain/usecases/reset-password'
import { MissingParamError, InvalidParamError } from '../../errors'
import { InvalidPasswordError } from '../../errors/invalid-password-error'
import { badRequest, serverError, ok } from '../../helpers/http-helper'
import { Controller } from '../../protocols/controller'
import { HttpRequest, HttpResponse } from '../../protocols/http'
import { PasswordValidator } from '../../protocols/password-validator'
import { EmailValidator } from '../signup/signup-protocols'

export class ResetPasswordController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly passwordValidator: PasswordValidator
  private readonly resetPassword: ResetPassword

  constructor (emailValidator: EmailValidator, passwordValidator: PasswordValidator, resetPassword: ResetPassword) {
    this.emailValidator = emailValidator
    this.passwordValidator = passwordValidator
    this.resetPassword = resetPassword
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password, passwordConfirmation } = httpRequest.body

      const params = ['email', 'password', 'passwordConfirmation']

      for (const param of params) {
        if (!httpRequest.body[param]) {
          return badRequest(new MissingParamError(param))
        }
      }

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isEmailValid = this.emailValidator.isValid(email)

      if (!isEmailValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const isPasswordValid = this.passwordValidator.isValid(password)

      if (!isPasswordValid) {
        return badRequest(new InvalidPasswordError())
      }

      const account = await this.resetPassword.reset(email, password)

      return ok(account)
    } catch (error) {
      return serverError()
    }
  }
}
