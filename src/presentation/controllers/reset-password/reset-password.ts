import { MissingParamError, InvalidParamError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import { Controller } from '../../protocols/controller'
import { HttpRequest, HttpResponse } from '../../protocols/http'

export class ResetPasswordController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
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
  }
}
