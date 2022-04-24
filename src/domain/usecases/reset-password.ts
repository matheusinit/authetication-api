import { AccountModel } from '../models/account'

export interface ResetPassword {
  reset: (token: string, password: string) => Promise<AccountModel>
}
