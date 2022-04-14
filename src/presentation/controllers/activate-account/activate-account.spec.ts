import { MissingParamError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { ActivateAccountController } from './activate-account'

describe('ActivateAccount Controller', () => {
  it('Should return 400 if email is not provided', async () => {
    const sut = new ActivateAccountController()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })
})
