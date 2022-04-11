import { AccountInfo, ActivateAccount } from '../../../domain/usecases/activate-account'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'

export class DbActivateAccount implements ActivateAccount {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository

  constructor (loadAccountByEmailRepository: LoadAccountByEmailRepository) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
  }

  async activate (accountInfo: AccountInfo): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountInfo.email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    return null
  }
}
