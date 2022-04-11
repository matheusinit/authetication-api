import { AccountModel } from '../usecases/db-add-account/db-add-account-protocols'

export interface UpdateAccountRepository {
  update: (id: string, update: any) => Promise<AccountModel>
}
