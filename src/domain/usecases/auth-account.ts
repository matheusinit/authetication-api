export interface Credentials {
  email: string
  password: string
}

export interface Session {
  token: string
  username: string
  email: string
}

export interface AuthAccount {
  auth: (credentials: Credentials) => Promise<Session>
}
