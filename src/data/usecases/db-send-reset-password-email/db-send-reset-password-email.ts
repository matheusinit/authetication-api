import { SendResetPasswordEmail } from '../../../domain/usecases/send-reset-password-email'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountError } from '../../errors/account-error'
import { HashGenerator } from '../../protocols/hash-generator'
import { EmailSender } from '../../protocols/email-sender'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'

export class DbSendResetPasswordEmail implements SendResetPasswordEmail {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly hashGenerator: HashGenerator
  private readonly emailSender: EmailSender
  private readonly updateAccountRepository: UpdateAccountRepository

  constructor (
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    hashGenerator: HashGenerator,
    emailSender: EmailSender,
    updateAccountRepository: UpdateAccountRepository
  ) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.hashGenerator = hashGenerator
    this.emailSender = emailSender
    this.updateAccountRepository = updateAccountRepository
  }

  async send (email: string): Promise<void> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    if (account.status === 'inactive') {
      throw new AccountError('Account is inactive', 'AccountIsInactiveError')
    }

    const token = this.hashGenerator.generate()

    await this.updateAccountRepository.update(account.id, { token })

    await this.emailSender.sendEmail('reset-password', {
      to: email,
      from: 'Auth API <reset-password@authapi.com>',
      subject: 'Authentication API - Defina a sua nova senha',
      data: {
        token
      }
    })
  }
}
