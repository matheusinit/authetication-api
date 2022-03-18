import { AccountModel, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'
import { CheckUsernameRepository } from '../protocols/check-username-repository'
import { UnavailableUsernameError } from '../errors/unavailable-username-error'
import { CheckEmailRepository } from '../protocols/check-email-repository'
import { UnavailableEmailError } from '../errors/unavailable-email-error'

interface SutTypes {
  sut: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
  checkUsernameRepositoryStub: CheckUsernameRepository
  checkEmailRepositoryStub: CheckEmailRepository
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        username: 'valid_username',
        email: 'valid_email@mail.com',
        password: 'hashed_password'
      }

      return await new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new AddAccountRepositoryStub()
}

const makeCheckUsernameRepository = (): CheckUsernameRepository => {
  class CheckUsernameRepositoryStub implements CheckUsernameRepository {
    async checkUsername (username: string): Promise<boolean> {
      return true
    }
  }

  return new CheckUsernameRepositoryStub()
}

const makeCheckEmailRepository = (): CheckEmailRepository => {
  class CheckEmailRepositoryStub implements CheckEmailRepository {
    async checkEmail (email: string): Promise<boolean> {
      return true
    }
  }

  return new CheckEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
  const addAccountRepositoryStub = makeAddAccountRepository()
  const encrypterStub = makeEncrypter()
  const checkUsernameRepositoryStub = makeCheckUsernameRepository()
  const checkEmailRepositoryStub = makeCheckEmailRepository()
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub, checkUsernameRepositoryStub, checkEmailRepositoryStub)

  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub,
    checkUsernameRepositoryStub,
    checkEmailRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  it('Should call CheckUsernameRepository with correct username', async () => {
    const { sut, checkUsernameRepositoryStub } = makeSut()
    const checkUsernameSpy = jest.spyOn(checkUsernameRepositoryStub, 'checkUsername')
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }

    await sut.add(accountData)

    expect(checkUsernameSpy).toHaveBeenCalledWith('valid_username')
  })

  it('Should throw if CheckUsernameRepository throws', () => {
    const { sut, checkUsernameRepositoryStub } = makeSut()
    jest.spyOn(checkUsernameRepositoryStub, 'checkUsername').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)

    void expect(promise).rejects.toThrow()
  })

  it('Should throw an error if CheckUsernameRepository return false', async () => {
    const { sut, checkUsernameRepositoryStub } = makeSut()
    jest.spyOn(checkUsernameRepositoryStub, 'checkUsername').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const accountData = {
      username: 'unavailable_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)

    void expect(promise).rejects.toThrow(new UnavailableUsernameError())
  })

  it('Should call CheckEmailRepository with correct email', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    const checkEmailSpy = jest.spyOn(checkEmailRepositoryStub, 'checkEmail')
    const accountData = {
      username: 'unavailable_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }
    await sut.add(accountData)
    expect(checkEmailSpy).toHaveBeenCalledWith('valid_email@email.com')
  })

  it('Should throw if CheckEmailRepository throws', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    jest.spyOn(checkEmailRepositoryStub, 'checkEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if CheckEmailRepository return false', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    jest.spyOn(checkEmailRepositoryStub, 'checkEmail').mockReturnValueOnce(new Promise(resolve => resolve(false)))
    const accountData = {
      username: 'valid_username',
      email: 'email_in_use@email.com',
      password: 'valid_password'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow(new UnavailableEmailError())
  })

  it('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await sut.add(accountData)

    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  it('Should throws if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)

    void expect(promise).rejects.toThrow()
  })

  it('Should call AddAccountRepository with correct password', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await sut.add(accountData)

    expect(addSpy).toHaveBeenCalledWith({
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })

  it('Should throws if AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)

    void expect(promise).rejects.toThrow()
  })

  it('Should return an account on success', async () => {
    const { sut } = makeSut()
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    const account = await sut.add(accountData)

    expect(account).toEqual({
      id: 'valid_id',
      username: 'valid_username',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })
})
