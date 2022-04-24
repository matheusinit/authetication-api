import { ResetPassword } from '../../../domain/usecases/reset-password'
import { InvalidParamError } from '../../../presentation/errors'
import { AccountError } from '../../errors/account-error'
import { NotFoundError } from '../../errors/not-found-error'
import { LoadAccountByTokenRepository } from '../../protocols/load-account-by-token-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel, Encrypter } from '../db-add-account/db-add-account-protocols'

export class DbResetPassword implements ResetPassword {
  private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
  private readonly updateAccountRepository: UpdateAccountRepository
  private readonly encrypter: Encrypter

  constructor (
    loadAccountByTokenRepository: LoadAccountByTokenRepository,
    updateAccountRepository: UpdateAccountRepository,
    encrypter: Encrypter
  ) {
    this.loadAccountByTokenRepository = loadAccountByTokenRepository
    this.updateAccountRepository = updateAccountRepository
    this.encrypter = encrypter
  }

  async reset (token: string, password: string): Promise<AccountModel> {
    const account = await this.loadAccountByTokenRepository.loadByToken(token)

    if (!account) {
      throw new NotFoundError('token')
    }

    if (account.status === 'inactive') {
      throw new AccountError('Account is inactive', 'AccountIsInactiveError')
    }

    const lifetime = new Date()

    lifetime.setMilliseconds(0)
    lifetime.setHours(lifetime.getHours() - 24)

    if (account.tokenCreatedAt <= lifetime) {
      throw new InvalidParamError('token')
    }

    const newPassword = await this.encrypter.encrypt(password)

    const updatedAccount = await this.updateAccountRepository.update(account.id, { password: newPassword })

    return updatedAccount
  }
}
