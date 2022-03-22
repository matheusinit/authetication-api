import { AuthAccount, Credentials, Session } from '../../../domain/usecases/auth-account'
import { MissingParamError, ServerError } from '../../errors'
import { LoginController } from './login'

interface SutTypes {
  sut: LoginController
  authAccountStub: AuthAccount
}

const makeSut = (): SutTypes => {
  class AuthAccountStub implements AuthAccount {
    async auth (credentials: Credentials): Promise<Session> {
      const fakeAccount = {
        token: 'valid_token',
        username: 'valid_username',
        email: 'valid_email@email.com'
      }
      return await new Promise(resolve => resolve(fakeAccount))
    }
  }

  const authAccountStub = new AuthAccountStub()
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
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
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
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
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
    expect(httpResponse.body).toEqual(new ServerError())
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
    expect(httpResponse.body).toEqual({
      token: 'valid_token',
      username: 'valid_username',
      email: 'valid_email@email.com'
    })
  })
})
