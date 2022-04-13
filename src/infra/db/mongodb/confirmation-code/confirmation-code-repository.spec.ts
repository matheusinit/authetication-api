import { Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helper'
import { ConfirmationCodeRepository } from './confirmation-code-repository'

let collection: Collection

describe('ConfirmationCode Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    collection = MongoHelper.getCollection('confirmation-code')
    await collection.deleteMany({})
  })

  describe('storeConfirmationCode()', () => {
    it('Should return undefined on save confirmation code', async () => {
      const sut = new ConfirmationCodeRepository()
      const result = await sut.storeConfirmationCode('any_confirmation_code', 'any_email@mail.com')

      expect(result).toBe(undefined)
    })
  })

  describe('loadByEmail', () => {
    it('Should return a confirmation code on success', async () => {
      const sut = new ConfirmationCodeRepository()

      // Insert fake account
      const fakeAccount = {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'any_status'
      }
      const accountCollection = MongoHelper.getCollection('accounts')
      await accountCollection.insertOne(fakeAccount)

      // Insert fake confirmation code
      const fakeConfirmationCode = {
        code: 'any_code',
        created_at: new Date()
      }
      const { insertedId } = await collection.insertOne(fakeConfirmationCode)

      // Update confirmation code of fake account
      await accountCollection.findOneAndUpdate(
        { email: 'any_email@mail.com' },
        {
          $set: { code_id: insertedId }
        }
      )

      const confirmationCode = await sut.loadByEmail('any_email@mail.com')

      expect(confirmationCode).toBeTruthy()
      expect(confirmationCode.code).toBe('any_code')
    })
  })
})
