import { MissingParamError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { SendResetPasswordEmailController } from './send-reset-password-email'

const makeSut = (): SendResetPasswordEmailController => {
  return new SendResetPasswordEmailController()
}

describe('SendResetPasswordEmail Controller', () => {
  it('Should return a bad request if email is not provided', async () => {
    const sut = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })
})
