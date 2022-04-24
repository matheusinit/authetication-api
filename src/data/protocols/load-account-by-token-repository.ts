import { AccountModel } from '../usecases/db-add-account/db-add-account-protocols'

export interface LoadAccountByTokenRepository {
  loadByToken: (token: string) => Promise<AccountModel>
}
