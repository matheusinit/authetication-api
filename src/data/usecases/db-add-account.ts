import { UnavailableEmailError } from '../errors/unavailable-email-error'
import { UnavailableUsernameError } from '../errors/unavailable-username-error'
import { CheckEmailRepository } from '../protocols/check-email-repository'
import { CheckUsernameRepository } from '../protocols/check-username-repository'
import { AccountModel, AddAccount, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  private readonly encrypter: Encrypter
  private readonly addAccountRepository: AddAccountRepository
  private readonly checkUsernameRepository: CheckUsernameRepository
  private readonly checkEmailRepository: CheckEmailRepository

  constructor (encrypter: Encrypter, addAccountRepository: AddAccountRepository, checkUsernameRepository: CheckUsernameRepository, checkEmailRepository: CheckEmailRepository) {
    this.encrypter = encrypter
    this.addAccountRepository = addAccountRepository
    this.checkUsernameRepository = checkUsernameRepository
    this.checkEmailRepository = checkEmailRepository
  }

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const isUsernameAvailable = await this.checkUsernameRepository.checkUsername(accountData.username)
    if (!isUsernameAvailable) {
      throw new UnavailableUsernameError()
    }
    const isEmailAvailable = await this.checkEmailRepository.checkEmail(accountData.email)
    if (!isEmailAvailable) {
      throw new UnavailableEmailError()
    }
    const hashedPassword = await this.encrypter.encrypt(accountData.password)
    const accountWithHashedPassword = Object.assign({}, accountData, { password: hashedPassword })
    const accountDb = await this.addAccountRepository.add(accountWithHashedPassword)

    return accountDb
  }
}
