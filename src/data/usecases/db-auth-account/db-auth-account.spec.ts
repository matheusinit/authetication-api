import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { TokenGenerator } from '../../protocols/token-generator'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbAuthAccount } from './db-auth-account'

interface SutTypes {
  sut: DbAuthAccount
  tokenGeneratorStub: TokenGenerator
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeTokenGeneratorStub = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    generate (payload: any): string {
      return 'any_token'
    }
  }

  return new TokenGeneratorStub()
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (password: string): Promise<AccountModel> {
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

  return new LoadAccountByEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
  const tokenGeneratorStub = makeTokenGeneratorStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbAuthAccount(tokenGeneratorStub, loadAccountByEmailRepositoryStub)
  return {
    sut,
    tokenGeneratorStub,
    loadAccountByEmailRepositoryStub
  }
}

describe('DbAuthAccount', () => {
  it('Should call LoadAccountByEmailRepository with correct values', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
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
      id: 'any_id',
      email: 'any_email@mail.com'
    })
  })

  it('Should call TokenGenerator with the results of LoadAccountByEmailRepository', async () => {
    const { sut, tokenGeneratorStub, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    loadByEmailSpy.mockReturnValueOnce(new Promise(resolve => resolve({
      id: 'this_account_id',
      username: 'this_account_id',
      email: 'this_account_email@mail.com',
      password: 'hashed_password',
      status: 'any_status'
    })))
    const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(generateSpy).toHaveBeenCalledWith({
      id: 'this_account_id',
      email: 'this_account_email@mail.com'
    })

    loadByEmailSpy.mockReturnValueOnce(new Promise(resolve => resolve({
      id: 'another_account_id',
      username: 'another_account_id',
      email: 'another_account_email@mail.com',
      password: 'hashed_password',
      status: 'any_status'
    })))

    await sut.auth(accountInfo)
    expect(generateSpy).toHaveBeenCalledWith({
      id: 'another_account_id',
      email: 'another_account_email@mail.com'
    })
  })

  it('Should return a session on success', async () => {
    const { sut } = makeSut()
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    const session = await sut.auth(accountInfo)
    expect(session).toBe('any_token')
  })
})
