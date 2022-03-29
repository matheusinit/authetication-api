import { MissingParamError } from '../../errors'
import { SendConfirmationCodeController } from './send-confirmation-code'

const makeSut = (): SendConfirmationCodeController => {
  return new SendConfirmationCodeController()
}

describe('SendConfirmartionCode Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const sut = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
})
