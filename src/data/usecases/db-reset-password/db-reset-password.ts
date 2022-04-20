import { ResetPassword } from '../../../domain/usecases/reset-password'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'

export class DbResetPassword implements ResetPassword {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly updateAccountRepository: UpdateAccountRepository

  constructor (loadAccountByEmailRepository: LoadAccountByEmailRepository, updateAccountRepository: UpdateAccountRepository) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.updateAccountRepository = updateAccountRepository
  }

  async reset (email: string, password: string): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    if (account.status === 'inactive') {
      throw new Error('Account is inactive')
    }

    await this.updateAccountRepository.update(account.id, { password: 'new_hashed_password' })

    return null
  }
}
