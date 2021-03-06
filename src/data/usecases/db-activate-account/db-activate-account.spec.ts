import { ConfirmationCode } from '../../../domain/models/confirmation-code'
import { AccountError } from '../../errors/account-error'
import { InvalidConfirmationCodeError } from '../../errors/invalid-confirmation-code-error'
import { NotFoundError } from '../../errors/not-found-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { LoadConfirmationCodeByEmailRepository } from '../../protocols/load-confirmation-code-by-email-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbActivateAccount } from './db-activate-account'

interface SutTypes {
  sut: DbActivateAccount
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  loadConfirmationCodeByEmailRepositoryStub: LoadConfirmationCodeByEmailRepository
  updateAccountRepositoryStub: UpdateAccountRepository
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@email.com',
        password: 'hashed_password',
        status: 'any_status'
      }
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeLoadConfirmationCodeByEmailRepositoryStub = (): LoadConfirmationCodeByEmailRepository => {
  class LoadConfirmationCodeByEmailRepositoryStub implements LoadConfirmationCodeByEmailRepository {
    async loadByEmail (email: string): Promise<ConfirmationCode> {
      return {
        id: 'any_id',
        code: 'any_code',
        createdAt: new Date()
      }
    }
  }
  return new LoadConfirmationCodeByEmailRepositoryStub()
}

const makeUpdateAccountRepositoryStub = (): UpdateAccountRepository => {
  class UpdateAccountRepositoryStub implements UpdateAccountRepository {
    async update (id: string, update: any): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@email.com',
        password: 'hashed_password',
        status: 'active'
      }
    }
  }
  return new UpdateAccountRepositoryStub()
}

const makeSut = (): SutTypes => {
  const updateAccountRepositoryStub = makeUpdateAccountRepositoryStub()
  const loadConfirmationCodeByEmailRepositoryStub = makeLoadConfirmationCodeByEmailRepositoryStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbActivateAccount(
    loadAccountByEmailRepositoryStub,
    loadConfirmationCodeByEmailRepositoryStub,
    updateAccountRepositoryStub
  )

  return {
    sut,
    loadAccountByEmailRepositoryStub,
    loadConfirmationCodeByEmailRepositoryStub,
    updateAccountRepositoryStub
  }
}

describe('DbActivateAccount Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    const accountInfo = {
      email: 'any_email@mail.com',
      confirmationCode: 'any_code'
    }
    await sut.activate(accountInfo)

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should throw an error if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const accountInfo = {
      email: 'unregistered_email@mail.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new NotFoundError('email'))
  })

  it('Should throws if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const accountInfo = {
      email: 'any_email@mail.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if account is already active', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve({
      id: 'any_id',
      username: 'any_username',
      email: 'any_email@email.com',
      password: 'hashed_password',
      status: 'active'
    })))

    const accountInfo = {
      email: 'any_email@mail.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new AccountError('Account is already active', 'AccountIsActiveError'))
  })

  it('Should call LoadConfirmationCodeByEmailRepository with correct email', async () => {
    const { sut, loadConfirmationCodeByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadConfirmationCodeByEmailRepositoryStub, 'loadByEmail')

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    await sut.activate(accountInfo)

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should throw an error if LoadConfirmationCodeByEmailRepository returns null', async () => {
    const { sut, loadConfirmationCodeByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadConfirmationCodeByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'inexistent_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new NotFoundError('confirmationCode'))
  })

  it('Should throws if LoadConfirmationCodeByEmailRepository throws', async () => {
    const { sut, loadConfirmationCodeByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadConfirmationCodeByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if code has more than 6 hours of lifetime', async () => {
    const { sut, loadConfirmationCodeByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadConfirmationCodeByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => {
      const now = new Date()

      resolve({
        id: 'any_id',
        code: 'any_code',
        createdAt: new Date(now.setHours(now.getHours() - 6, now.getMinutes() - 1, now.getSeconds() - 1))
      })
    }))

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime'))
  })

  it('Should throw an error if code has exactly 6 hours of lifetime', async () => {
    const { sut, loadConfirmationCodeByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadConfirmationCodeByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => {
      const now = new Date()
      now.setMilliseconds(0)

      now.setHours(now.getHours() - 6)

      resolve({
        id: 'any_id',
        code: 'any_code',
        createdAt: now
      })
    }))

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime'))
  })

  it('Should throw an error if confirmation code does not match', async () => {
    const { sut } = makeSut()

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'invalid_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow(new InvalidConfirmationCodeError('Invalid Confirmation Code'))
  })

  it('Should call UpdateAccountRepository with correct values', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccountRepositoryStub, 'update')

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    await sut.activate(accountInfo)

    expect(updateSpy).toHaveBeenCalledWith('any_id', {
      status: 'active'
    })
  })

  it('Should throw if UpdateAccountRepoitory throws', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    jest.spyOn(updateAccountRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    const promise = sut.activate(accountInfo)

    await expect(promise).rejects.toThrow()
  })

  it('Should return an active account on success', async () => {
    const { sut } = makeSut()

    const accountInfo = {
      email: 'any_email@email.com',
      confirmationCode: 'any_code'
    }
    const account = await sut.activate(accountInfo)

    expect(account).toEqual({
      id: 'any_id',
      username: 'any_username',
      email: 'any_email@email.com',
      password: 'hashed_password',
      status: 'active'
    })
  })
})
