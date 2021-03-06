import { AccountError } from '../../errors/account-error'
import { EmailContent, EmailSender } from '../../protocols/email-sender'
import { HashGenerator } from '../../protocols/hash-generator'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { DbSendResetPasswordEmail } from './db-send-reset-password-email'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { NotFoundError } from '../../errors/not-found-error'

interface SutTypes {
  sut: DbSendResetPasswordEmail
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashGeneratorStub: HashGenerator
  emailSenderStub: EmailSender
  updateAccountRepositoryStub: UpdateAccountRepository
}

const makeUpdateAccountRepositoryStub = (): UpdateAccountRepository => {
  class UpdateAccountRepositoryStub implements UpdateAccountRepository {
    async update (id: string, update: any): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'active'
      }
    }
  }

  return new UpdateAccountRepositoryStub()
}

const makeEmailSenderStub = (): EmailSender => {
  class EmailSenderStub implements EmailSender {
    async sendEmail (template: string, content: EmailContent): Promise<void> {
      return null
    }
  }
  return new EmailSenderStub()
}

const makeHashGeneratorStub = (): HashGenerator => {
  class HashGeneratorStub implements HashGenerator {
    generate (): string {
      return 'any_hash'
    }
  }

  return new HashGeneratorStub()
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
  const updateAccountRepositoryStub = makeUpdateAccountRepositoryStub()
  const emailSenderStub = makeEmailSenderStub()
  const hashGeneratorStub = makeHashGeneratorStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbSendResetPasswordEmail(loadAccountByEmailRepositoryStub, hashGeneratorStub, emailSenderStub, updateAccountRepositoryStub)

  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashGeneratorStub,
    emailSenderStub,
    updateAccountRepositoryStub
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

    await expect(promise).rejects.toThrow(new NotFoundError('email'))
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

  it('Should call UpdateAccountRepository with correct values', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccountRepositoryStub, 'update')
    const now = new Date()
    now.setMilliseconds(0)

    await sut.send('any_email@email.com')

    expect(updateSpy).toHaveBeenCalledWith('any_id', {
      token: 'any_hash',
      tokenCreatedAt: now
    })
  })

  it('Should throw if UpdateAccountRepository throws', async () => {
    const { sut, updateAccountRepositoryStub } = makeSut()
    jest.spyOn(updateAccountRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow()
  })

  it('Should call EmailSender with correct values', async () => {
    const { sut, emailSenderStub } = makeSut()
    const sendEmailSpy = jest.spyOn(emailSenderStub, 'sendEmail')

    await sut.send('any_email@email.com')

    expect(sendEmailSpy).toHaveBeenCalledWith('reset-password', {
      to: 'any_email@email.com',
      from: 'Auth API <reset-password@authapi.com>',
      subject: 'Authentication API - Defina a sua nova senha',
      data: {
        token: 'any_hash'
      }
    })
  })

  it('Should throw if EmailSender throws', async () => {
    const { sut, emailSenderStub } = makeSut()
    jest.spyOn(emailSenderStub, 'sendEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = sut.send('any_email@email.com')

    await expect(promise).rejects.toThrow()
  })
})
