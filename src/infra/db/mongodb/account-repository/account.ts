import { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { CheckUsernameRepository } from '../../../../data/protocols/check-username-repository'
import { CheckEmailRepository } from '../../../../data/protocols/check-email-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository, CheckUsernameRepository, CheckEmailRepository {
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
    return true
  }
}
