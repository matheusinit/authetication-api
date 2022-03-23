import { AuthAccount, Credentials, Session } from '../../../domain/usecases/auth-account'
import { AuthAccountRepository } from '../../protocols/auth-account-repository'
import { TokenGenerator } from '../../protocols/token-generator'

export class DbAuthAccount implements AuthAccount {
  private readonly tokenGenerator: TokenGenerator
  private readonly authAccountRepository: AuthAccountRepository

  constructor (tokenGenerator: TokenGenerator, authAccountRepository: AuthAccountRepository) {
    this.tokenGenerator = tokenGenerator
    this.authAccountRepository = authAccountRepository
  }

  async auth (credentials: Credentials): Promise<Session> {
    await this.authAccountRepository.auth(credentials)

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
