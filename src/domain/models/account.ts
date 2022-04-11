import { ConfirmationCode } from './confirmation-code'

export interface AccountModel {
  id: string
  username: string
  email: string
  password: string
  status: string
  confirmationCode?: ConfirmationCode
}
