import { ResetPassword } from '../../../domain/usecases/reset-password'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../db-add-account/db-add-account-protocols'

export class DbResetPassword implements ResetPassword {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository

  constructor (loadAccountByEmailRepository: LoadAccountByEmailRepository) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository
  }

  async reset (email: string, password: string): Promise<AccountModel> {
    await this.loadAccountByEmailRepository.loadByEmail(email)

    return null
  }
}
