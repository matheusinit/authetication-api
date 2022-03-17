import { UsernameError } from '../errors/username-error'
import { CheckUsernameRepository } from '../protocols/check-username-repository'
import { AccountError, AccountModel, AddAccount, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  private readonly encrypter: Encrypter
  private readonly addAccountRepository: AddAccountRepository
  private readonly checkUsernameRepository: CheckUsernameRepository

  constructor (encrypter: Encrypter, addAccountRepository: AddAccountRepository, checkUsernameRepository: CheckUsernameRepository) {
    this.encrypter = encrypter
    this.addAccountRepository = addAccountRepository
    this.checkUsernameRepository = checkUsernameRepository
  }

  async add (accountData: AddAccountModel): Promise<AccountModel | AccountError> {
    const isUsernameAvailable = await this.checkUsernameRepository.checkUsername(accountData.username)
    if (!isUsernameAvailable) {
      return {
        error: new UsernameError()
      }
    }
    const hashedPassword = await this.encrypter.encrypt(accountData.password)
    const accountWithHashedPassword = Object.assign({}, accountData, { password: hashedPassword })
    const accountDb = await this.addAccountRepository.add(accountWithHashedPassword)

    return accountDb
  }
}
