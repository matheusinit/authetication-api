import { AuthAccount, Credentials, Session } from '../../../domain/usecases/auth-account'
import { TokenGenerator } from '../../protocols/token-generator'

export class DbAuthAccount implements AuthAccount {
  private readonly tokenGenerator: TokenGenerator

  constructor (tokenGenerator: TokenGenerator) {
    this.tokenGenerator = tokenGenerator
  }

  async auth (credentials: Credentials): Promise<Session> {
    this.tokenGenerator.generate({
      id: 'valid_id',
      email: 'any_email@mail.com'
    })

    return {
      token: '',
      username: '',
      email: ''
    }
  }
}
