import { SendResetPasswordEmail } from '../../../domain/usecases/send-reset-password-email'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { EmailValidator } from '../signup/signup-protocols'
import { SendResetPasswordEmailController } from './send-reset-password-email'

interface SutTypes {
  sut: SendResetPasswordEmailController
  emailValidatorStub: EmailValidator
  sendResetPasswordEmailStub: SendResetPasswordEmail
}

const makeSendResetPasswordEmailStub = (): SendResetPasswordEmail => {
  class SendResetPasswordEmailStub implements SendResetPasswordEmail {
    async send (email: string): Promise<void> {
      return null
    }
  }

  return new SendResetPasswordEmailStub()
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
  const sendResetPasswordEmailStub = makeSendResetPasswordEmailStub()
  const emailValidatorStub = makeEmailValidatorStub()
  const sut = new SendResetPasswordEmailController(emailValidatorStub, sendResetPasswordEmailStub)

  return {
    sut,
    emailValidatorStub,
    sendResetPasswordEmailStub
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

  it('Should call Email Validator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    await sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should return a bad request if email is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('email')))
  })

  it('Should return server error if Email Validator throws', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should call SendResetPasswordEmail with correct email', async () => {
    const { sut, sendResetPasswordEmailStub } = makeSut()
    const sendSpy = jest.spyOn(sendResetPasswordEmailStub, 'send')
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    await sut.handle(httpRequest)

    expect(sendSpy).toHaveBeenCalledWith('any_email@email.com')
  })
})
