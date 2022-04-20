import { ResetPassword } from '../../../domain/usecases/reset-password'
import { EmailNotRegisteredError } from '../../errors/email-not-registered-error'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { UpdateAccountRepository } from '../../protocols/update-account-repository'
import { AccountModel, Encrypter } from '../db-add-account/db-add-account-protocols'

export class DbResetPassword implements ResetPassword {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  private readonly updateAccountRepository: UpdateAccountRepository
  private readonly encrypter: Encrypter

  constructor (
    loadAccountByEmailRepository: LoadAccountByEmailRepository,
    updateAccountRepository: UpdateAccountRepository,
    encrypter: Encrypter
  ) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
    this.updateAccountRepository = updateAccountRepository
    this.encrypter = encrypter
  }

  async reset (email: string, password: string): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)

    if (!account) {
      throw new EmailNotRegisteredError()
    }

    if (account.status === 'inactive') {
      throw new Error('Account is inactive')
    }

    const newPassword = await this.encrypter.encrypt(password)

    await this.updateAccountRepository.update(account.id, { password: newPassword })

    return null
  }
}
