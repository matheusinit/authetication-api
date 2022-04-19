import { AccountModel } from '../models/account'

export interface ResetPassword {
  reset: (email: string, password: string) => Promise<AccountModel>
}
