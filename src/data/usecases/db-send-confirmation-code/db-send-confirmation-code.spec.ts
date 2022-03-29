import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { DbSendConfirmationCode } from './db-send-confirmation-code'

interface SutTypes {
  sut: DbSendConfirmationCode
  checkEmailRepositoryStub: CheckEmailRepository
}

const makeCheckEmailRepositoryStub = (): CheckEmailRepository => {
  class CheckEmailRepositoryStub implements CheckEmailRepository {
    async checkEmail (email: string): Promise<boolean> {
      return false
    }
  }
  return new CheckEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
  const checkEmailRepositoryStub = makeCheckEmailRepositoryStub()
  const sut = new DbSendConfirmationCode(checkEmailRepositoryStub)
  return {
    sut,
    checkEmailRepositoryStub
  }
}

describe('DbSendConfirmationCode', () => {
  it('Should call CheckEmailRepository with correct email', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    const checkEmailSpy = jest.spyOn(checkEmailRepositoryStub, 'checkEmail')
    await sut.send('any_email@mail.com')
    expect(checkEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should throw an error if email is not registered', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    jest.spyOn(checkEmailRepositoryStub, 'checkEmail').mockReturnValueOnce(new Promise(resolve => resolve(true)))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow(new EmailNotRegisteredError())
  })
})
