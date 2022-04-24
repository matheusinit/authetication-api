export interface AccountModel {
  id: string
  username: string
  email: string
  password: string
  status: string
  token?: string
  tokenCreatedAt?: Date
  code_id?: string
}
