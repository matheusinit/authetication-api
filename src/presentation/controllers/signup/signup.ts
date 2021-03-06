import { AddAccount, Controller, EmailValidator, HttpRequest, HttpResponse } from './signup-protocols'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { PasswordValidator } from '../../protocols/password-validator'
import { UnavailableUsernameError } from '../../../data/errors/unavailable-username-error'
import { UnavailableEmailError } from '../../../data/errors/unavailable-email-error'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly addAccount: AddAccount
  private readonly passwordValidator: PasswordValidator

  constructor (
    emailValidator: EmailValidator,
    addAccount: AddAccount,
    passwordValidator: PasswordValidator
  ) {
    this.emailValidator = emailValidator
    this.addAccount = addAccount
    this.passwordValidator = passwordValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredParams = ['username', 'email', 'password', 'passwordConfirmation']

      for (const param of requiredParams) {
        if (!httpRequest.body[param]) {
          return badRequest(new MissingParamError(param))
        }
      }

      const { username, email, password, passwordConfirmation } = httpRequest.body

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValid = this.emailValidator.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const isPasswordValid = this.passwordValidator.isValid(password)

      if (!isPasswordValid) {
        return badRequest(new InvalidParamError('password'))
      }

      const account = await this.addAccount.add({
        username,
        email,
        password
      })

      return ok(account)
    } catch (error) {
      if (error instanceof UnavailableUsernameError) {
        return badRequest(error)
      }

      if (error instanceof UnavailableEmailError) {
        return badRequest(error)
      }
      return serverError()
    }
  }
}
