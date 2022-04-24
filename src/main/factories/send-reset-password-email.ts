import path from 'path'
import { DbSendResetPasswordEmail } from '../../data/usecases/db-send-reset-password-email/db-send-reset-password-email'
import { AccountMongoRepository } from '../../infra/db/mongodb/account/account-repository'
import { NodemailerAdapter } from '../../infra/mail/nodemailer-adapter'
import { SendResetPasswordEmailController } from '../../presentation/controllers/send-reset-password-email/send-reset-password-email'
import { EmailValidatorAdapter } from '../../utils/adapters/email-validator-adapter'
import { TemplateRendererAdapter } from '../../utils/adapters/template-renderer-adapter'
import { Hasher } from '../../utils/hash-generator/hasher'
import settings from '../config/settings'

export const makeSendResetPasswordEmailController = (): SendResetPasswordEmailController => {
  const baseDir = path.join(settings.appRoot, 'src', 'infra', 'mail', 'views')

  const emailValidator = new EmailValidatorAdapter()
  const accountRepository = new AccountMongoRepository()
  const hashGenerator = new Hasher()
  const templateRenderer = new TemplateRendererAdapter({ baseDir, ext: '.hbs' })
  const emailSender = new NodemailerAdapter(templateRenderer)
  const sendResetPasswordEmail = new DbSendResetPasswordEmail(accountRepository, hashGenerator, emailSender, accountRepository)
  const controller = new SendResetPasswordEmailController(emailValidator, sendResetPasswordEmail)
  return controller
}
