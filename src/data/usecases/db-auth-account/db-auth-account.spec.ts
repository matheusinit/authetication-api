import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { PasswordNotMatchError } from '../../errors/password-not-match-error'
import { HashComparator } from '../../protocols/hash-comparator'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { TokenGenerator } from '../../protocols/token-generator'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbAuthAccount } from './db-auth-account'

interface SutTypes {
  sut: DbAuthAccount
  tokenGeneratorStub: TokenGenerator
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparatorStub: HashComparator
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

const makeHashComparatorStub = (): HashComparator => {
  class HashComparatorStub implements HashComparator {
    async compare (password: string, hash: string): Promise<boolean> {
      return true
    }
  }
  return new HashComparatorStub()
}

const makeSut = (): SutTypes => {
  const tokenGeneratorStub = makeTokenGeneratorStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const hashComparatorStub = makeHashComparatorStub()
  const sut = new DbAuthAccount(tokenGeneratorStub, loadAccountByEmailRepositoryStub, hashComparatorStub)
  return {
    sut,
    tokenGeneratorStub,
    loadAccountByEmailRepositoryStub,
    hashComparatorStub
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

  it('Should throw an error if LoadAccountByEmailRepository return null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(null)
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    const promise = sut.auth(accountInfo)
    await expect(promise).rejects.toThrow(new EmailNotRegisteredError())
  })

  it('Should call HashComparator with correct values', async () => {
    const { sut, hashComparatorStub } = makeSut()
    const compareSpy = jest.spyOn(hashComparatorStub, 'compare')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })

  it('Should throw an error if HashComparator return false', async () => {
    const { sut, hashComparatorStub } = makeSut()
    jest.spyOn(hashComparatorStub, 'compare').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    const promise = sut.auth(accountInfo)
    await expect(promise).rejects.toThrow(new PasswordNotMatchError())
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
      id: 'valid_id',
      username: 'valid_username',
      email: 'valid_email@mail.com',
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
      id: 'valid_id',
      email: 'valid_email@mail.com'
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
