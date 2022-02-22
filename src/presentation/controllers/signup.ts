export class SignUpController {
  handle (httpRequest: any): any {
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
  }
}
