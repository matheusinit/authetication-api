import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
import { AccountIsActiveError } from '../../errors/account-is-active-error'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'

export class DbSendConfirmationCode implements SendConfirmationCode {
  private readonly checkEmailRepository: CheckEmailRepository
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository

  constructor (
    checkEmailRepository: CheckEmailRepository,
    loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {
    this.checkEmailRepository = checkEmailRepository
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
  }

  async send (email: string): Promise<void> {
    const isExistentEmail = await this.checkEmailRepository.checkEmail(email)

    if (isExistentEmail) {
      throw new EmailNotRegisteredError()
    }

    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (account.status === 'active') {
      throw new AccountIsActiveError()
    }
  }
}
