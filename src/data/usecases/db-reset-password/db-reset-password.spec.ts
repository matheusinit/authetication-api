import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbResetPassword } from './db-reset-password'

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

describe('DbResetPassword Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const loadAccountByEmailRepositoryStub = new LoadAccountByEmailRepositoryStub()
    const sut = new DbResetPassword(loadAccountByEmailRepositoryStub)
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await sut.reset('any_email@email.com', 'any_password')

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })
})
