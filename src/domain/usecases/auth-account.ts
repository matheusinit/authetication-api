import { AccountModel } from '../models/account'

export interface Credentials {
  email: string
  password: string
}

export interface AuthAccount {
  auth: (credentials: Credentials) => Promise<AccountModel>
}
