import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'

export class DbSendConfirmationCode implements SendConfirmationCode {
  private readonly checkEmailRepository: CheckEmailRepository

  constructor (checkEmailRepository: CheckEmailRepository) {
    this.checkEmailRepository = checkEmailRepository
  }

  async send (email: string): Promise<void> {
    throw new EmailNotRegisteredError()
  }
}
