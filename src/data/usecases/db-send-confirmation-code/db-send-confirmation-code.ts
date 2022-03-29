import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
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

    await this.loadAccountByEmailRepository.loadByEmail(email)
  }
}
