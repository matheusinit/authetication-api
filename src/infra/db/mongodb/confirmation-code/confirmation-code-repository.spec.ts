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
})
