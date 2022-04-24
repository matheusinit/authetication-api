import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel, Encrypter } from '../db-add-account/db-add-account-protocols'
import { DbResetPassword } from './db-reset-password'
import { AccountError } from '../../errors/account-error'
import { LoadAccountByTokenRepository } from '../../protocols/load-account-by-token-repository'
import { NotFoundError } from '../../errors/not-found-error'

interface SutTypes {
  sut: DbResetPassword
  loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
  updateAccountRepositoryStub: UpdateAccountRepository
  encrypterStub: Encrypter
}

const makeLoadAccountByTokenRepositoryStub = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (token: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'active'
      }
    }
  }
  return new LoadAccountByTokenRepositoryStub()
}

const makeUpdateAccountRepositoryStub = (): UpdateAccountRepository => {
  class UpdateAccountRepositoryStub implements UpdateAccountRepository {
    async update (id: string, update: any): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'new_hashed_password',
        status: 'active'
      }
    }
  }

  return new UpdateAccountRepositoryStub()
}

const makeEncrypterStub = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return 'new_hashed_password'
    }
  }

  return new EncrypterStub()
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypterStub()
  const updateAccountRepositoryStub = makeUpdateAccountRepositoryStub()
  const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepositoryStub()
  const sut = new DbResetPassword(loadAccountByTokenRepositoryStub, updateAccountRepositoryStub, encrypterStub)

  return {
    sut,
    loadAccountByTokenRepositoryStub,
    updateAccountRepositoryStub,
    encrypterStub
  }
}

describe('DbResetPassword Usecase', () => {
  it('Should call LoadAccountByTokenRepository with correct values', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')

    await sut.reset('any_hash', 'any_password')

    expect(loadByTokenSpy).toHaveBeenCalledWith('any_hash')
  })

  it('Should throw an error if LoadAccountByTokenRepository return null', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const promise = sut.reset('any_hash', 'any_password')

    await expect(promise).rejects.toThrow(new NotFoundError('token'))
  })

  it('Should throw if LoadAccountByTokenRepository throws', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.reset('any_hash', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if account is inactive', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(new Promise(resolve => {
      return resolve({
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'inactive'
      })
    }))

    const promise = sut.reset('any_hash', 'any_password')

    await expect(promise).rejects.toThrow(new AccountError('Account is inactive', 'AccountIsInactiveError'))
  })

  it('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    await sut.reset('any_hash', 'any_password')

    expect(encryptSpy).toHaveBeenCalledWith('any_password')
  })

  it('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.reset('any_hash', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should call UpdateAccountRepository with correct values', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccountRepositoryStub, 'update')

    await sut.reset('any_hash', 'any_password')

    expect(updateSpy).toHaveBeenCalledWith('any_id', { password: 'new_hashed_password' })
  })

  it('Should throw if UpdateAccountRepository throws', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    jest.spyOn(updateAccountRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.reset('any_hash', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should return updated account on success', async () => {
    const { sut } = makeSut()

    const account = await sut.reset('any_hash', 'any_password')

    expect(account).toEqual({
      id: 'any_id',
      username: 'any_username',
      email: 'any_email',
      password: 'new_hashed_password',
      status: 'active'
    })
  })
})
