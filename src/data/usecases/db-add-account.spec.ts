import { AccountModel, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'
import { CheckUsernameRepository } from '../protocols/check-username-repository'

interface SutTypes {
  sut: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
  checkUsernameRepositoryStub: CheckUsernameRepository
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

const makeSut = (): SutTypes => {
  class CheckUsernameRepositoryStub implements CheckUsernameRepository {
    async check (username: string): Promise<boolean> {
      return true
    }
  }

  const addAccountRepositoryStub = makeAddAccountRepository()
  const encrypterStub = makeEncrypter()
  const checkUsernameRepositoryStub = new CheckUsernameRepositoryStub()
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub, checkUsernameRepositoryStub)

  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub,
    checkUsernameRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  it('Should call CheckUsernameRepository with correct username', async () => {
    const { sut, checkUsernameRepositoryStub } = makeSut()
    const checkSpy = jest.spyOn(checkUsernameRepositoryStub, 'check')
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }

    await sut.add(accountData)

    expect(checkSpy).toHaveBeenCalledWith('valid_username')
  })

  it('Should throw if CheckUsernameRepository throws', () => {
    const { sut, checkUsernameRepositoryStub } = makeSut()
    jest.spyOn(checkUsernameRepositoryStub, 'check').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const accountData = {
      username: 'valid_username',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }

    const promise = sut.add(accountData)

    void expect(promise).rejects.toThrow()
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
