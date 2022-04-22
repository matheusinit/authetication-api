import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbSendResetPasswordEmail } from './db-send-reset-password-email'

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

describe('SendResetPasswordEmail Usecase', () => {
  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const loadAccountByEmailRepositoryStub = new LoadAccountByEmailRepositoryStub()
    const sut = new DbSendResetPasswordEmail(loadAccountByEmailRepositoryStub)
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await sut.send('any_email@email.com')

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })
})
