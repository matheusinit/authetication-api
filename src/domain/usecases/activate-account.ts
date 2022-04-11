import { AccountModel } from '../models/account'

export interface AccountInfo {
  email: string
  confirmationCode: string
}

export interface ActivateAccount {
  activate: (accountInfo: AccountInfo) => Promise<AccountModel>
}
