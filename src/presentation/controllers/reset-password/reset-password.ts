import { MissingParamError, InvalidParamError } from '../../errors'
import { InvalidPasswordError } from '../../errors/invalid-password-error'
import { badRequest, serverError } from '../../helpers/http-helper'
import { Controller } from '../../protocols/controller'
import { HttpRequest, HttpResponse } from '../../protocols/http'
import { PasswordValidator } from '../../protocols/password-validator'
import { EmailValidator } from '../signup/signup-protocols'

export class ResetPasswordController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly passwordValidator: PasswordValidator

  constructor (emailValidator: EmailValidator, passwordValidator: PasswordValidator) {
    this.emailValidator = emailValidator
    this.passwordValidator = passwordValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password, passwordConfirmation } = httpRequest.body

      if (!email) {
        return badRequest(new MissingParamError('email'))
      }

      if (!password) {
        return badRequest(new MissingParamError('password'))
      }

      if (!passwordConfirmation) {
        return badRequest(new MissingParamError('passwordConfirmation'))
      }

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isEmailValid = this.emailValidator.isValid(email)

      if (!isEmailValid) {
        return badRequest(new InvalidPasswordError())
      }

      this.passwordValidator.isValid(password)
    } catch (error) {
      return serverError()
    }
  }
}
