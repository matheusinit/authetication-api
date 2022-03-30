import { StoreConfirmationCodeRepository } from '../../../../data/protocols/store-confirmation-code-repository'
import { MongoHelper } from '../helpers/mongo-helper'

export class ConfirmationCodeRepository implements StoreConfirmationCodeRepository {
  async storeConfirmationCode (confirmationCode: string, email: string): Promise<void> {
    const collection = MongoHelper.getCollection('confirmation-code')
    const userCollection = MongoHelper.getCollection('accounts')

    const result = await collection.insertOne({
      code: confirmationCode,
      created_at: new Date()
    })

    await userCollection.findOneAndUpdate({ email }, { $set: { code_id: result.insertedId } })
  }
}
