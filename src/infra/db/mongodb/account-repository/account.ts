import { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    const accountResult = await accountCollection.findOne(result.insertedId)
    const account = {
      id: accountResult?._id,
      username: accountResult?.username,
      email: accountResult?.email,
      password: accountResult?.password
    } as unknown as AccountModel
    return account
  }
}
