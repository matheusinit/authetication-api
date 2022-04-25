import { AccountInfo, ActivateAccount } from '../../../domain/usecases/activate-account'
import { AccountError } from '../../errors/account-error'
import { ConfirmationCodeNotFoundError } from '../../errors/confirmation-code-not-found-error'
import { InvalidConfirmationCodeError } from '../../errors/invalid-confirmation-code-error'
import { NotFoundError } from '../../errors/not-found-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { LoadConfirmationCodeByEmailRepository } from '../../protocols/load-confirmation-code-by-email-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'

export class DbActivateAccount implements ActivateAccount {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly loadConfirmationCodeByEmailRepository: LoadConfirmationCodeByEmailRepository
  private readonly updateAccountRepository: UpdateAccountRepository

  constructor (
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    loadConfirmationCodeByEmailRepository: LoadConfirmationCodeByEmailRepository,
    updateAccountRepository: UpdateAccountRepository
  ) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.loadConfirmationCodeByEmailRepository = loadConfirmationCodeByEmailRepository
    this.updateAccountRepository = updateAccountRepository
  }

  async activate (accountInfo: AccountInfo): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountInfo.email)

    if (!account) {
      throw new NotFoundError('email')
    }

    if (account.status === 'active') {
      throw new AccountError('Account is already active', 'AccountIsActiveError')
    }

    const confirmationCode = await this.loadConfirmationCodeByEmailRepository.loadByEmail(accountInfo.email)

    if (!confirmationCode) {
      throw new ConfirmationCodeNotFoundError()
    }

    const limitTime = new Date()
    limitTime.setMilliseconds(0)

    limitTime.setHours(limitTime.getHours() - 6)

    if (confirmationCode.createdAt <= limitTime) {
      throw new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime')
    }

    if (confirmationCode.code !== accountInfo.confirmationCode) {
      throw new InvalidConfirmationCodeError('Invalid Confirmation Code')
    }

    const activeAccount = await this.updateAccountRepository.update(account.id, { status: 'active' })

    return activeAccount
  }
}
