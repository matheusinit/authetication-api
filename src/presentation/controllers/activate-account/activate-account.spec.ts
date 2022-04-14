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

const makeSut = (): SutTypes => {
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

  const emailValidatorStub = makeEmailValidatorStub()
  const activateAccountStub = new ActivateAccountStub()
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
