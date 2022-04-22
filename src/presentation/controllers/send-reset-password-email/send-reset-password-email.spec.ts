import { InvalidParamError, MissingParamError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { EmailValidator } from '../signup/signup-protocols'
import { SendResetPasswordEmailController } from './send-reset-password-email'

interface SutTypes {
  sut: SendResetPasswordEmailController
  emailValidatorStub: EmailValidator
}

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidatorStub()
  const sut = new SendResetPasswordEmailController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SendResetPasswordEmail Controller', () => {
  it('Should return a bad request if email is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {}
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return a bad request if email is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('email')))
  })
})
