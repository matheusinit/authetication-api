import { AccountInfo, ActivateAccount } from '../../../domain/usecases/activate-account'
import { AccountIsActiveError } from '../../errors/account-is-active-error'
import { ConfirmationCodeNotFoundError } from '../../errors/confirmation-code-not-found-error'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { InvalidConfirmationCodeError } from '../../errors/invalid-confirmation-code-error'
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

    const confirmationCode = await this.loadConfirmationCodeByEmailRepository.loadByEmail(accountInfo.email)

    if (!confirmationCode) {
      throw new ConfirmationCodeNotFoundError()
    }

    const limitTime = new Date()
    limitTime.setHours(limitTime.getHours() - 6)

    if (confirmationCode.createdAt < limitTime) {
      throw new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime')
    }

    return null
  }
}
