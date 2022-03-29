import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { DbSendConfirmationCode } from './db-send-confirmation-code'

describe('DbSendConfirmationCode', () => {
  it('Should throw an error if email is not registered', async () => {
    class CheckEmailRepositoryStub implements CheckEmailRepository {
      async checkEmail (email: string): Promise<boolean> {
        return true
      }
    }
    const checkEmailRepositoryStub = new CheckEmailRepositoryStub()
    const sut = new DbSendConfirmationCode(checkEmailRepositoryStub)
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow(new EmailNotRegisteredError())
  })
})
