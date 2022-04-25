import { NotFoundError } from '../../../data/errors/not-found-error'
import { AuthAccount, Credentials } from '../../../domain/usecases/auth-account'
import { MissingParamError, ServerError } from '../../errors'
import { appError } from '../../helpers/error-helper'
import { LoginController } from './login'

interface SutTypes {
  sut: LoginController
  authAccountStub: AuthAccount
}

const makeAuthAccountStub = (): AuthAccount => {
  class AuthAccountStub implements AuthAccount {
    async auth (credentials: Credentials): Promise<String> {
      return await new Promise(resolve => resolve('any_token'))
    }
  }

  return new AuthAccountStub()
}

const makeSut = (): SutTypes => {
  const authAccountStub = makeAuthAccountStub()
  const sut = new LoginController(authAccountStub)

  return {
    sut,
    authAccountStub
  }
}

describe('Login Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('password')))
  })

  it('Should return 400 if email is not registered', async () => {
    const { sut, authAccountStub } = makeSut()
    jest.spyOn(authAccountStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new NotFoundError('email'))))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new NotFoundError('email')))
  })

  it('Should return 400 if password doest not match', async () => {
    const { sut, authAccountStub } = makeSut()
    jest.spyOn(authAccountStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new NotFoundError('password'))))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new NotFoundError('password')))
  })

  it('Should call AuthAccount with correct values', async () => {
    const { sut, authAccountStub } = makeSut()
    const authSpy = jest.spyOn(authAccountStub, 'auth')
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  it('Should return 500 if AuthAccount throws', async () => {
    const { sut, authAccountStub } = makeSut()
    jest.spyOn(authAccountStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({ token: 'any_token' })
  })
})
