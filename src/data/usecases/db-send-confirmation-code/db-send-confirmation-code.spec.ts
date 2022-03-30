import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { DbSendConfirmationCode } from './db-send-confirmation-code'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { AccountIsActiveError } from '../../errors/account-is-active-error'
import { CodeGenerator } from '../../protocols/code-generator'
import { StoreConfirmationCodeRepository } from '../../protocols/store-confirmation-code-repository'
import { EmailContent, EmailSender } from '../../protocols/email-sender'

interface SutTypes {
  sut: DbSendConfirmationCode
  checkEmailRepositoryStub: CheckEmailRepository
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  codeGeneratorStub: CodeGenerator
  storeConfirmationCodeRepositoryStub: StoreConfirmationCodeRepository
  emailSenderStub: EmailSender
}

const makeCheckEmailRepositoryStub = (): CheckEmailRepository => {
  class CheckEmailRepositoryStub implements CheckEmailRepository {
    async checkEmail (email: string): Promise<boolean> {
      return false
    }
  }
  return new CheckEmailRepositoryStub()
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'inactive'
      }
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeCodeGeneratorStub = (): CodeGenerator => {
  class CodeGeneratorStub implements CodeGenerator {
    generateCode (): string {
      return 'any_code'
    }
  }
  return new CodeGeneratorStub()
}

const makeStoreConfirmationCodeRepositoryStub = (): StoreConfirmationCodeRepository => {
  class StoreConfirmationCodeRepositoryStub implements StoreConfirmationCodeRepository {
    async storeConfirmationCode (confirmationCode: string, email: string): Promise<void> {
      return null
    }
  }
  return new StoreConfirmationCodeRepositoryStub()
}

const makeEmailSenderStub = (): EmailSender => {
  class EmailSenderStub implements EmailSender {
    async sendEmail (content: EmailContent): Promise<void> {
      return null
    }
  }
  return new EmailSenderStub()
}

const makeSut = (): SutTypes => {
  const checkEmailRepositoryStub = makeCheckEmailRepositoryStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const codeGeneratorStub = makeCodeGeneratorStub()
  const storeConfirmationCodeRepositoryStub = makeStoreConfirmationCodeRepositoryStub()
  const emailSenderStub = makeEmailSenderStub()
  const sut = new DbSendConfirmationCode(
    checkEmailRepositoryStub,
    loadAccountByEmailRepositoryStub,
    codeGeneratorStub,
    storeConfirmationCodeRepositoryStub,
    emailSenderStub
  )
  return {
    sut,
    checkEmailRepositoryStub,
    loadAccountByEmailRepositoryStub,
    codeGeneratorStub,
    storeConfirmationCodeRepositoryStub,
    emailSenderStub
  }
}

describe('DbSendConfirmationCode', () => {
  it('Should call CheckEmailRepository with correct email', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    const checkEmailSpy = jest.spyOn(checkEmailRepositoryStub, 'checkEmail')
    await sut.send('any_email@mail.com')
    expect(checkEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should throws if CheckEmailRepository throws', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    jest.spyOn(checkEmailRepositoryStub, 'checkEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })

  it('Should throw an error if email is not registered', async () => {
    const { sut, checkEmailRepositoryStub } = makeSut()
    jest.spyOn(checkEmailRepositoryStub, 'checkEmail').mockReturnValueOnce(new Promise(resolve => resolve(true)))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow(new EmailNotRegisteredError())
  })

  it('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.send('any_email@mail.com')
    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should throw an error if account is active', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => {
      resolve({
        id: 'any_id',
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'active'
      })
    }))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow(new AccountIsActiveError())
  })

  it('Should call CodeGenerator', async () => {
    const { sut, codeGeneratorStub } = makeSut()
    const generateSpy = jest.spyOn(codeGeneratorStub, 'generateCode')
    await sut.send('any_email@mail.com')
    expect(generateSpy).toHaveBeenCalled()
  })

  it('Should throws if CodeGenerator throws', async () => {
    const { sut, codeGeneratorStub } = makeSut()
    jest.spyOn(codeGeneratorStub, 'generateCode').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })

  it('Should call StoreConfirmationCodeRepository with correct values', async () => {
    const { sut, storeConfirmationCodeRepositoryStub } = makeSut()
    const storeConfirmationCodeSpy = jest.spyOn(storeConfirmationCodeRepositoryStub, 'storeConfirmationCode')
    await sut.send('any_email@mail.com')
    expect(storeConfirmationCodeSpy).toHaveBeenCalledWith('any_code', 'any_email@mail.com')
  })

  it('Should throw if StoreConfirmationCodeRepository throws', async () => {
    const { sut, storeConfirmationCodeRepositoryStub } = makeSut()
    jest.spyOn(storeConfirmationCodeRepositoryStub, 'storeConfirmationCode').mockReturnValue(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })

  it('Should call EmailSender with correct values', async () => {
    const { sut, emailSenderStub } = makeSut()
    const sendEmailSpy = jest.spyOn(emailSenderStub, 'sendEmail')
    await sut.send('any_email@mail.com')
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'any_email@mail.com',
      from: 'Auth API <confirm@authapi.com>',
      subject: 'Authentication API - Código de confirmação',
      html: '<p><b>Authentication API</b> Código: any_code</p>'
    })
  })

  it('Should throw if EmailSender throws', async () => {
    const { sut, emailSenderStub } = makeSut()
    jest.spyOn(emailSenderStub, 'sendEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })
})
