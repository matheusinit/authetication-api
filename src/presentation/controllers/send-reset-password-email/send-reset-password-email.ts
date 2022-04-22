import { SendResetPasswordEmail } from '../../../domain/usecases/send-reset-password-email'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, serverError, ok } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'

export class SendResetPasswordEmailController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly sendResetPasswordEmail: SendResetPasswordEmail

  constructor (emailValidator: EmailValidator, sendResetPasswordEmail: SendResetPasswordEmail) {
    this.emailValidator = emailValidator
    this.sendResetPasswordEmail = sendResetPasswordEmail
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email } = httpRequest.body

      if (!email) {
        return badRequest(new MissingParamError('email'))
      }

      const isEmailValid = this.emailValidator.isValid(email)

      if (!isEmailValid) {
        return badRequest(new InvalidParamError('email'))
      }

      await this.sendResetPasswordEmail.send(email)

      return ok({ message: 'Email sent' })
    } catch (error) {
      return serverError()
    }
  }
}
