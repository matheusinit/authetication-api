import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { DbSendConfirmationCode } from './db-send-confirmation-code'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'
import { AccountIsActiveError } from '../../errors/account-is-active-error'
import { CodeGenerator } from '../../protocols/code-generator'

interface SutTypes {
  sut: DbSendConfirmationCode
  checkEmailRepositoryStub: CheckEmailRepository
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  codeGeneratorStub: CodeGenerator
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
    generate (): string {
      return 'any_code'
    }
  }
  return new CodeGeneratorStub()
}

const makeSut = (): SutTypes => {
  const checkEmailRepositoryStub = makeCheckEmailRepositoryStub()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const codeGeneratorStub = makeCodeGeneratorStub()
  const sut = new DbSendConfirmationCode(checkEmailRepositoryStub, loadAccountByEmailRepositoryStub, codeGeneratorStub)
  return {
    sut,
    checkEmailRepositoryStub,
    loadAccountByEmailRepositoryStub,
    codeGeneratorStub
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
    const generateSpy = jest.spyOn(codeGeneratorStub, 'generate')
    await sut.send('any_email@mail.com')
    expect(generateSpy).toHaveBeenCalled()
  })

  it('Should throws if CodeGenerator throws', async () => {
    const { sut, codeGeneratorStub } = makeSut()
    jest.spyOn(codeGeneratorStub, 'generate').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.send('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })
})
