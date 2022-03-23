import { Credentials } from '../../../domain/usecases/auth-account'
import { AuthAccountRepository } from '../../protocols/auth-account-repository'
import { TokenGenerator } from '../../protocols/token-generator'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbAuthAccount } from './db-auth-account'

interface SutTypes {
  sut: DbAuthAccount
  tokenGeneratorStub: TokenGenerator
  authAccountRepositoryStub: AuthAccountRepository
}

const makeTokenGeneratorStub = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    generate (payload: any): string {
      return 'any_token'
    }
  }

  return new TokenGeneratorStub()
}

const makeSut = (): SutTypes => {
  class AuthAccountRepositoryStub implements AuthAccountRepository {
    async auth (credentials: Credentials): Promise<AccountModel> {
      const fakeAccount: AccountModel = {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'any_status'
      }

      return await new Promise(resolve => resolve(fakeAccount))
    }
  }
  const tokenGeneratorStub = makeTokenGeneratorStub()
  const authAccountRepositoryStub = new AuthAccountRepositoryStub()
  const sut = new DbAuthAccount(tokenGeneratorStub, authAccountRepositoryStub)
  return {
    sut,
    tokenGeneratorStub,
    authAccountRepositoryStub
  }
}

describe('DbAuthAccount', () => {
  it('Should call AuthAccountRepository with correct values', async () => {
    const { sut, authAccountRepositoryStub } = makeSut()
    const authSpy = jest.spyOn(authAccountRepositoryStub, 'auth')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  it('Should call TokenGenerator with correct values', async () => {
    const { sut, tokenGeneratorStub } = makeSut()
    const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(generateSpy).toHaveBeenCalledWith({
      id: 'valid_id',
      email: 'any_email@mail.com'
    })
  })
})
