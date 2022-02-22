import { HttpRequest, HttpResponse } from '../protocols/http'

export class SignUpController {
  handle (httpRequest: HttpRequest): HttpResponse {
    if (!httpRequest.body.username) {
      return {
        statusCode: 400,
        body: new Error('Expecting param: username')
      }
    }

    if (!httpRequest.body.email) {
      return {
        statusCode: 400,
        body: new Error('Expecting param: email')
      }
    }

    return {
      statusCode: 0,
      body: ''
    }
  }
}
