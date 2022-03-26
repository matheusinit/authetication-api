import { AuthAccount, Credentials } from '../../../domain/usecases/auth-account'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { TokenGenerator } from '../../protocols/token-generator'

export class DbAuthAccount implements AuthAccount {
  private readonly tokenGenerator: TokenGenerator
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository

  constructor (tokenGenerator: TokenGenerator, loadAccountByEmailRepository: LoadAccountByEmailRepository) {
    this.tokenGenerator = tokenGenerator
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
  }

  async auth (credentials: Credentials): Promise<String> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(credentials.email)

    const token = this.tokenGenerator.generate({
      id: account.id,
      email: account.email
    })

    return token
  }
}
