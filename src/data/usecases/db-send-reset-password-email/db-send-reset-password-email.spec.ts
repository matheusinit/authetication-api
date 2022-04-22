import { AccountError } from '../../errors/account-error'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { HashGenerator } from '../../protocols/hash-generator'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbSendResetPasswordEmail } from './db-send-reset-password-email'

interface SutTypes {
  sut: DbSendResetPasswordEmail
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashGeneratorStub: HashGenerator
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'active'
      }
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
  class HashGeneratorStub implements HashGenerator {
    generate (): string {
      return 'any_hash'
    }
  }
  const hashGeneratorStub = new HashGeneratorStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbSendResetPasswordEmail(loadAccountByEmailRepositoryStub, hashGeneratorStub)

  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashGeneratorStub
  }
}

describe('SendResetPasswordEmail Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await sut.send('any_email@email.com')

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if LoadAccountByEmailRepository return false', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow(new EmailNotRegisteredError())
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

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow(new AccountError('Account is inactive', 'AccountIsInactiveError'))
  })

  it('Should call HashGenerator', async () => {
    const { sut, hashGeneratorStub } = makeSut()
    const generateSpy = jest.spyOn(hashGeneratorStub, 'generate')

    await sut.send('any_email@email.com')

    expect(generateSpy).toHaveBeenCalled()
  })

  it('Should throw if HashGenerator throws', async () => {
    const { sut, hashGeneratorStub } = makeSut()
    jest.spyOn(hashGeneratorStub, 'generate').mockImplementationOnce(() => {
      throw new Error()
    })

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow()
  })
})
