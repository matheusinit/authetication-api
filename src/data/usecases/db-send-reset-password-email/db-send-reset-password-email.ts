import { SendResetPasswordEmail } from '../../../domain/usecases/send-reset-password-email'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'

export class DbSendResetPasswordEmail implements SendResetPasswordEmail {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository

  constructor (loadAccountByEmailRepository: LoadAccountByEmailRepository) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
  }

  async send (email: string): Promise<void> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }
  }
}
