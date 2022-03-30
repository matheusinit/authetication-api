import { DbSendConfirmationCode } from '../../data/usecases/db-send-confirmation-code/db-send-confirmation-code'
import { AccountMongoRepository } from '../../infra/db/mongodb/account/account-repository'
import { ConfirmationCodeRepository } from '../../infra/db/mongodb/confirmation-code/confirmation-code-repository'
import { NodemailerAdapter } from '../../infra/mail/nodemailer-adapter'
import { SendConfirmationCodeController } from '../../presentation/controllers/send-confirmation-code/send-confirmation-code'
import { EmailValidatorAdapter } from '../../utils/adapters/email-validator-adapter'
import { Generator } from '../../utils/code-generator/code-generator'

export const makeSendConfirmationCodeController = (): SendConfirmationCodeController => {
  const emailValidator = new EmailValidatorAdapter()
  const accountMongoRepository = new AccountMongoRepository()
  const confirmationCodeRepository = new ConfirmationCodeRepository()
  const codeGenerator = new Generator()
  const emailSender = new NodemailerAdapter()
  const sendConfirmationCode = new DbSendConfirmationCode(accountMongoRepository, accountMongoRepository, codeGenerator, confirmationCodeRepository, emailSender)
  const sendConfirmationCodeController = new SendConfirmationCodeController(emailValidator, sendConfirmationCode)
  return sendConfirmationCodeController
}
