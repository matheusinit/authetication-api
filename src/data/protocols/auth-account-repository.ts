import { Credentials } from '../../domain/usecases/auth-account'
import { AccountModel } from '../usecases/db-add-account/db-add-account-protocols'

export interface AuthAccountRepository {
  auth: (credentials: Credentials) => Promise<AccountModel>
}
