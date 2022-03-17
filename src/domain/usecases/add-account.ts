import { AccountModel } from '../models/account'

export interface AddAccountModel {
  username: string
  email: string
  password: string
}

export interface AccountError {
  error: Error
}

export interface AddAccount {
  add: (accountData: AddAccountModel) => Promise<AccountModel | AccountError>
}
