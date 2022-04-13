import { LoadConfirmationCodeByEmailRepository } from '../../../../data/protocols/load-confirmation-code-by-email-repository'
import { StoreConfirmationCodeRepository } from '../../../../data/protocols/store-confirmation-code-repository'
import { AccountModel } from '../../../../domain/models/account'
import { ConfirmationCode } from '../../../../domain/models/confirmation-code'
import { MongoHelper } from '../helpers/mongo-helper'

export class ConfirmationCodeRepository implements StoreConfirmationCodeRepository, LoadConfirmationCodeByEmailRepository {
  async storeConfirmationCode (confirmationCode: string, email: string): Promise<void> {
    const collection = MongoHelper.getCollection('confirmation-code')
    const userCollection = MongoHelper.getCollection('accounts')

    const result = await collection.insertOne({
      code: confirmationCode,
      created_at: new Date()
    })

    await userCollection.findOneAndUpdate({ email }, { $set: { code_id: result.insertedId } })
  }

  async loadByEmail (email: string): Promise<ConfirmationCode> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const collection = MongoHelper.getCollection('confirmation-code')

    const resultAccount = await accountCollection.findOne({ email })

    if (resultAccount) {
      const account = MongoHelper.map(resultAccount) as AccountModel
      const confirmationCode = await collection.findOne({ _id: account.code_id })

      return confirmationCode === null ? confirmationCode : MongoHelper.map(confirmationCode)
    }
  }
}
