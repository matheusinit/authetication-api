import { SendConfirmationCode } from '../../../domain/usecases/send-confirmation-code'
import { AccountError } from '../../errors/account-error'
import { NotFoundError } from '../../errors/not-found-error'
import { CheckEmailRepository } from '../../protocols/check-email-repository'
import { CodeGenerator } from '../../protocols/code-generator'
import { EmailSender } from '../../protocols/email-sender'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { StoreConfirmationCodeRepository } from '../../protocols/store-confirmation-code-repository'

export class DbSendConfirmationCode implements SendConfirmationCode {
  private readonly checkEmailRepository: CheckEmailRepository
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly codeGenerator: CodeGenerator
  private readonly storeConfirmationCodeRepository: StoreConfirmationCodeRepository
  private readonly emailSender: EmailSender

  constructor (
    checkEmailRepository: CheckEmailRepository,
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    codeGenerator: CodeGenerator,
    storeConfirmationCodeRepository: StoreConfirmationCodeRepository,
    emailSender: EmailSender
  ) {
    this.checkEmailRepository = checkEmailRepository
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.codeGenerator = codeGenerator
    this.storeConfirmationCodeRepository = storeConfirmationCodeRepository
    this.emailSender = emailSender
  }

  async send (email: string): Promise<void> {
    const isExistentEmail = await this.checkEmailRepository.checkEmail(email)

    if (isExistentEmail) {
      throw new NotFoundError('email')
    }

    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (account.status === 'active') {
      throw new AccountError('Account is already active', 'AccountIsActiveError')
    }

    const confirmationCode = this.codeGenerator.generateCode()

    await this.storeConfirmationCodeRepository.storeConfirmationCode(confirmationCode, email)

    await this.emailSender.sendEmail('confirmation-email', {
      to: email,
      from: 'Auth API <confirm@authapi.com>',
      subject: 'Authentication API - C??digo de confirma????o',
      data: {
        code: confirmationCode
      }
    })
  }
}
