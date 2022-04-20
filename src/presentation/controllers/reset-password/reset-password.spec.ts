import { MissingParamError } from '../../errors/missing-param-error'
import { appError } from '../../helpers/error-helper'
import { ResetPasswordController } from './reset-password'

describe('ResetPassword Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const sut = new ResetPasswordController()
    const httpRequest = {
      body: {
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return 400 if no password is provided', async () => {
    const sut = new ResetPasswordController()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('password')))
  })
})
