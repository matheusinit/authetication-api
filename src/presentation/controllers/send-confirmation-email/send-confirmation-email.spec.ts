import { MissingParamError } from '../../errors'
import { SendConfirmationEmailController } from './send-confirmation-email'

describe('SendConfirmationEmail Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const sut = new SendConfirmationEmailController()
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
