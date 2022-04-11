import { AccountInfo, ActivateAccount } from '../../../domain/usecases/activate-account'
import { AccountIsActiveError } from '../../errors/account-is-active-error'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { LoadConfirmationCodeByEmailRepository } from '../../protocols/load-confirmation-code-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'

export class DbActivateAccount implements ActivateAccount {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly loadConfirmationCodeByEmailRepository: LoadConfirmationCodeByEmailRepository

  constructor (
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    loadConfirmationCodeByEmailRepository: LoadConfirmationCodeByEmailRepository
  ) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.loadConfirmationCodeByEmailRepository = loadConfirmationCodeByEmailRepository
  }

  async activate (accountInfo: AccountInfo): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountInfo.email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    if (account.status === 'active') {
      throw new AccountIsActiveError()
    }

    await this.loadConfirmationCodeByEmailRepository.loadByEmail(accountInfo.email)

    return null
  }
}
