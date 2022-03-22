import { DbAddAccount } from '../../data/usecases/db-add-account'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { SignUpController } from '../../presentation/controllers/signup/signup'
import { PasswordValidatorAdapter } from '../../utils/adapters/password-validator-adapter'
import { EmailValidatorAdapter } from '../../utils/adapters/email-validator-adapter'

export const makeSignUpController = (): SignUpController => {
  const salt = 12
  const encrypter = new BcryptAdapter(salt)
  const accountMongoRepository = new AccountMongoRepository()
  const emailValidator = new EmailValidatorAdapter()
  const passwordValidator = new PasswordValidatorAdapter()
  const dbAddAccount = new DbAddAccount(encrypter, accountMongoRepository, accountMongoRepository, accountMongoRepository)
  const signUpController = new SignUpController(emailValidator, dbAddAccount, passwordValidator)
  return signUpController
}
