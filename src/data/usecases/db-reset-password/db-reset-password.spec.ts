import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbResetPassword } from './db-reset-password'

interface SutTypes {
  sut: DbResetPassword
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  updateAccountRepositoryStub: UpdateAccountRepository
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'any_status'
      }
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
  class UpdateAccountRepositoryStub implements UpdateAccountRepository {
    async update (id: string, update: any): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'new_hashed_password',
        status: 'any_status'

      }
    }
  }
  const updateAccountRepositoryStub = new UpdateAccountRepositoryStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbResetPassword(loadAccountByEmailRepositoryStub, updateAccountRepositoryStub)

  return {
    sut,
    loadAccountByEmailRepositoryStub,
    updateAccountRepositoryStub
  }
}

describe('DbResetPassword Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await sut.reset('any_email@email.com', 'any_password')

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should throw an error if LoadAccountByEmailRepository return null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const promise = sut.reset('email_not_registered@email.com', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.reset('any_email@email.com', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if account is inactive', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => {
      return resolve({
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'inactive'
      })
    }))

    const promise = sut.reset('any_email@email.com', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  it('Should call UpdateAccountRepository with correct values', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccountRepositoryStub, 'update')

    await sut.reset('any_email@email.com', 'any_password')

    expect(updateSpy).toHaveBeenCalledWith('any_id', { password: 'new_hashed_password' })
  })

  it('Should throw if UpdateAccountRepository throws', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    jest.spyOn(updateAccountRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.reset('any_email@email.com', 'any_password')

    await expect(promise).rejects.toThrow()
  })
})
