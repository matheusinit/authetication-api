import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbActivateAccount } from './db-activate-account'

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

describe('DbActivateAccount Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const loadAccountByEmailRepositoryStub = new LoadAccountByEmailRepositoryStub()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    const sut = new DbActivateAccount(loadAccountByEmailRepositoryStub)

    const accountInfo = {
      email: 'any_email@mail.com',
      confirmationCode: 'any_code'
    }
    await sut.activate(accountInfo)

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
