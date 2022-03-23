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
    const account = await this.authAccountRepository.auth(credentials)

    const token = this.tokenGenerator.generate({
      id: account.id,
      email: account.email
    })

    return {
      token,
      username: account.username,
      email: account.email
    }
  }
}
