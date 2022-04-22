import { DbResetPassword } from '../../data/usecases/db-reset-password/db-reset-password'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account/account-repository'
import { ResetPasswordController } from '../../presentation/controllers/reset-password/reset-password'
import { EmailValidatorAdapter } from '../../utils/adapters/email-validator-adapter'
import { PasswordValidatorAdapter } from '../../utils/adapters/password-validator-adapter'

export const makeResetPasswordController = (): ResetPasswordController => {
  const salt = 12
  const encrypter = new BcryptAdapter(salt)
  const accountMongoRepository = new AccountMongoRepository()
  const resetPassword = new DbResetPassword(accountMongoRepository, accountMongoRepository, encrypter)
  const passwordValidator = new PasswordValidatorAdapter()
  const emailValidator = new EmailValidatorAdapter()
  const resetPasswordController = new ResetPasswordController(emailValidator, passwordValidator, resetPassword)

  return resetPasswordController
}
