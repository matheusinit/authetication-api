import { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { CheckUsernameRepository } from '../../../../data/protocols/check-username-repository'
import { CheckEmailRepository } from '../../../../data/protocols/check-email-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'
import { LoadAccountByEmailRepository } from '../../../../data/protocols/load-account-by-email-repository'
import { UpdateAccountRepository } from '../../../../data/protocols/update-account-repository'

export class AccountMongoRepository implements AddAccountRepository,
 CheckUsernameRepository, CheckEmailRepository, LoadAccountByEmailRepository, UpdateAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    const accountResult = await accountCollection.findOne(result.insertedId)
    return MongoHelper.map(accountResult)
  }

  async checkUsername (username: string): Promise<boolean> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const isAvailable = await accountCollection.findOne({ username })
    return isAvailable === null
  }

  async checkEmail (email: string): Promise<boolean> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const isAvailable = await accountCollection.findOne({ email })
    return isAvailable === null
  }

  async loadByEmail (email: string): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne({ email })
    if (account) {
      return MongoHelper.map(account)
    }
    return null
  }

  async update (id: string, update: any): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const { value: account } = await accountCollection.findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: 'after' })
    return account === null ? account : MongoHelper.map(account)
  }
}
