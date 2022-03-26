import { DbAuthAccount } from '../../data/usecases/db-auth-account/db-auth-account'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { JwtAdapter } from '../../infra/criptography/jwt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { LoginController } from '../../presentation/controllers/login/login'

export const makeLoginController = (): LoginController => {
  const salt = 12
  const tokenGenerator = new JwtAdapter()
  const loadAccountByEmailRepository = new AccountMongoRepository()
  const hashComparator = new BcryptAdapter(salt)
  const authAccount = new DbAuthAccount(tokenGenerator, loadAccountByEmailRepository, hashComparator)
  const loginController = new LoginController(authAccount)
  return loginController
}
