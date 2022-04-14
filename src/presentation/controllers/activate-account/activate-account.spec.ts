import { InvalidParamError, MissingParamError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { EmailValidator } from '../signup/signup-protocols'
import { ActivateAccountController } from './activate-account'

interface SutTypes {
  sut: ActivateAccountController
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  const emailValidatorStub = new EmailValidatorStub()
  const sut = new ActivateAccountController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('ActivateAccount Controller', () => {
  it('Should return 400 if email is not provided', async () => {
    const { sut } = makeSut()
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
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('confirmation code')))
  })

  it('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    await sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should return 400 if provided email is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('email')))
  })
})
