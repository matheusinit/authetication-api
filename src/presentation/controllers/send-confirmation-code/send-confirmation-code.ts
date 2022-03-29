import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'

export class SendConfirmationCodeController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly sendConfirmationCode: SendConfirmationCode

  constructor (emailValidator: EmailValidator, sendConfirmationCode: SendConfirmationCode) {
    this.emailValidator = emailValidator
    this.sendConfirmationCode = sendConfirmationCode
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

      await this.sendConfirmationCode.send(email)

      return ok({ message: 'Email with code sent' })
    } catch (error) {
      return serverError()
    }
  }
}
