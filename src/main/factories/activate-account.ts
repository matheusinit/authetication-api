import { DbActivateAccount } from '../../data/usecases/db-activate-account/db-activate-account'
import { AccountMongoRepository } from '../../infra/db/mongodb/account/account-repository'
import { ConfirmationCodeRepository } from '../../infra/db/mongodb/confirmation-code/confirmation-code-repository'
import { ActivateAccountController } from '../../presentation/controllers/activate-account/activate-account'
import { EmailValidatorAdapter } from '../../utils/adapters/email-validator-adapter'

export const makeActivateAccountController = (): ActivateAccountController => {
  const emailValidator = new EmailValidatorAdapter()
  const loadAccountByEmailRepository = new AccountMongoRepository()
  const loadConfirmationCodeByEmailRepository = new ConfirmationCodeRepository()
  const updateAccountRepository = new AccountMongoRepository()
  const activateAccount = new DbActivateAccount(
    loadAccountByEmailRepository,
    loadConfirmationCodeByEmailRepository,
    updateAccountRepository
  )
  return new ActivateAccountController(emailValidator, activateAccount)
}
