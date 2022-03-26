import { AuthAccount, Credentials } from '../../../domain/usecases/auth-account'
import { HashComparator } from '../../protocols/hash-comparator'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { TokenGenerator } from '../../protocols/token-generator'

export class DbAuthAccount implements AuthAccount {
  private readonly tokenGenerator: TokenGenerator
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly hashComparator: HashComparator

  constructor (
    tokenGenerator: TokenGenerator,
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    hashComparator: HashComparator
  ) {
    this.tokenGenerator = tokenGenerator
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.hashComparator = hashComparator
  }

  async auth (credentials: Credentials): Promise<String> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(credentials.email)

    if (!account) {
      throw new Error('EmailInUse')
    }

    const isValid = await this.hashComparator.compare(credentials.password, account.password)

    if (!isValid) {
      throw new Error('InvalidPassword')
    }

    const token = this.tokenGenerator.generate({
      id: account.id,
      email: account.email
    })

    return token
  }
}
