import { AccountError } from '../../../data/errors/account-error'
import { ConfirmationCodeNotFoundError } from '../../../data/errors/confirmation-code-not-found-error'
import { InvalidConfirmationCodeError } from '../../../data/errors/invalid-confirmation-code-error'
import { NotFoundError } from '../../../data/errors/not-found-error'
import { AccountInfo, ActivateAccount } from '../../../domain/usecases/activate-account'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { AccountModel, EmailValidator } from '../signup/signup-protocols'
import { ActivateAccountController } from './activate-account'

interface SutTypes {
  sut: ActivateAccountController
  emailValidatorStub: EmailValidator
  activateAccountStub: ActivateAccount
}

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeActivateAccountStub = (): ActivateAccount => {
  class ActivateAccountStub implements ActivateAccount {
    async activate (accountInfo: AccountInfo): Promise<AccountModel> {
      const fakeAccount = {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@email.com',
        password: 'hashed_password',
        status: 'active'
      }

      return await new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new ActivateAccountStub()
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidatorStub()
  const activateAccountStub = makeActivateAccountStub()
  const sut = new ActivateAccountController(emailValidatorStub, activateAccountStub)

  return {
    sut,
    emailValidatorStub,
    activateAccountStub
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

  it('Should return 500 if EmailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should call DbActivateAccount with correct values', async () => {
    const { sut, activateAccountStub } = makeSut()
    const activateSpy = jest.spyOn(activateAccountStub, 'activate')
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    await sut.handle(httpRequest)

    expect(activateSpy).toHaveBeenCalledWith({
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    })
  })

  it('Should return 404 if email is not registered in system', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new NotFoundError('email'))))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(404)
    expect(httpResponse.body).toEqual(appError(new NotFoundError('email')))
  })

  it('Should return 400 if account is already active', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new AccountError('Account is already active', 'AccountIsActiveError'))))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new AccountError('Account is already active', 'AccountIsActiveError')))
  })

  it('Should return 404 if confirmation code is not found', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new ConfirmationCodeNotFoundError())))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(404)
    expect(httpResponse.body).toEqual(appError(new ConfirmationCodeNotFoundError()))
  })

  it('Should return 400 if confirmation code has passed of its lifetime', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime'))))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime')))
  })

  it('Should return 400 if confirmation code does not match', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new InvalidConfirmationCodeError('Invalid Confirmation Code'))))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidConfirmationCodeError('Invalid Confirmation Code')))
  })

  it('Should return 500 if ActivateAccount throws', async () => {
    const { sut, activateAccountStub } = makeSut()
    jest.spyOn(activateAccountStub, 'activate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return an account on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        code: 'any_code'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'any_id',
      username: 'any_username',
      email: 'any_email@email.com',
      password: 'hashed_password',
      status: 'active'
    })
  })
})
