import { MissingParamError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class ActivateAccountController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email, code } = httpRequest.body

    if (!email) {
      return badRequest(new MissingParamError('email'))
    }
    if (!code) {
      return badRequest(new MissingParamError('confirmation code'))
    }
  }
}
