import { SendResetPasswordEmail } from '../../../domain/usecases/send-reset-password-email'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountError } from '../../errors/account-error'
import { HashGenerator } from '../../protocols/hash-generator'

export class DbSendResetPasswordEmail implements SendResetPasswordEmail {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly hashGenerator: HashGenerator

  constructor (loadAccountByEmailRepository: LoadAccountByEmailRepository, hashGenerator: HashGenerator) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.hashGenerator = hashGenerator
  }

  async send (email: string): Promise<void> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    if (account.status === 'inactive') {
      throw new AccountError('Account is inactive', 'AccountIsInactiveError')
    }

    this.hashGenerator.generate()
  }
}
