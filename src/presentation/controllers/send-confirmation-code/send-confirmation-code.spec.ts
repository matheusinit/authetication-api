import { AccountError } from '../../../data/errors/account-error'
import { NotFoundError } from '../../../data/errors/not-found-error'
import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { EmailValidator } from '../signup/signup-protocols'
import { SendConfirmationCodeController } from './send-confirmation-code'

interface SutTypes {
  sut: SendConfirmationCodeController
  emailValidatorStub: EmailValidator
  sendConfirmationCodeStub: SendConfirmationCode
}

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeSendConfirmationCodeStub = (): SendConfirmationCode => {
  class SendConfirmationCodeStub implements SendConfirmationCode {
    async send (email: string): Promise<void> {
      return null
    }
  }

  return new SendConfirmationCodeStub()
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidatorStub()
  const sendConfirmationCodeStub = makeSendConfirmationCodeStub()
  const sut = new SendConfirmationCodeController(emailValidatorStub, sendConfirmationCodeStub)

  return {
    sut,
    emailValidatorStub,
    sendConfirmationCodeStub
  }
}

describe('SendConfirmationCode Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: { }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return 400 if email provided is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('email')))
  })

  it('Should call SendConfirmationCode with correct email', async () => {
    const { sut, sendConfirmationCodeStub } = makeSut()
    const sendSpy = jest.spyOn(sendConfirmationCodeStub, 'send')
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    await sut.handle(httpRequest)
    expect(sendSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should return 400 if email is not registered', async () => {
    const { sut, sendConfirmationCodeStub } = makeSut()
    jest.spyOn(sendConfirmationCodeStub, 'send').mockReturnValueOnce(new Promise((resolve, reject) => reject(new NotFoundError('email'))))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new NotFoundError('email')))
  })

  it('Should return 400 if account is already active', async () => {
    const { sut, sendConfirmationCodeStub } = makeSut()
    jest.spyOn(sendConfirmationCodeStub, 'send').mockReturnValueOnce(new Promise((resolve, reject) => reject(new AccountError('Account is already active', 'AccountIsActiveError'))))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new AccountError('Account is already active', 'AccountIsActiveError')))
  })

  it('Should return 500 if SendConfirmationCode throws', async () => {
    const { sut, sendConfirmationCodeStub } = makeSut()
    jest.spyOn(sendConfirmationCodeStub, 'send').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 200 if code is sent successfully', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({ message: 'Email with code sent' })
  })
})
