import { AuthAccount, Credentials } from '../../../domain/usecases/auth-account'
import { MissingParamError } from '../../errors'
import { AccountModel } from '../signup/signup-protocols'
import { LoginController } from './login'

interface SutTypes {
  sut: LoginController
  authAccountStub: AuthAccount
}

const makeSut = (): SutTypes => {
  class AuthAccountStub implements AuthAccount {
    async auth (credentials: Credentials): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        username: 'valid_username',
        email: 'valid_email@email.com',
        password: 'valid_password',
        status: 'inactive'
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
})
