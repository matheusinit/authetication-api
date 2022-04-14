import { MissingParamError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { ActivateAccountController } from './activate-account'

const makeSut = (): ActivateAccountController => {
  return new ActivateAccountController()
}

describe('ActivateAccount Controller', () => {
  it('Should return 400 if email is not provided', async () => {
    const sut = makeSut()
    const httpRequest = {
      body: {
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return 400 if confirmation code is not provided', async () => {
    const sut = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('confirmation code')))
  })
})
