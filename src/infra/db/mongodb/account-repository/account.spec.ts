import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account'

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    const collection = MongoHelper.getCollection('accounts')
    await collection.deleteMany({})
  })

  const makeSut = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }

  it('Should return an account on success', async () => {
    const sut = makeSut()
    const account = await sut.add({
      username: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.username).toBe('any_name')
    expect(account.email).toBe('any_email@mail.com')
    expect(account.password).toBe('any_password')
  })

  it('Should checkUsername return true if username is available', async () => {
    const sut = makeSut()
    const isAvailable = await sut.checkUsername('available_username')
    expect(isAvailable).toBe(true)
  })

  it('Should checkUsername return false if username is unavailable', async () => {
    const sut = makeSut()
    const fakeAccount = {
      username: 'unavailable_username',
      email: 'valid_email@email.com',
      password: 'hashed_password'
    }
    await MongoHelper.getCollection('accounts').insertOne(fakeAccount)
    const isAvailable = await sut.checkUsername('unavailable_username')
    expect(isAvailable).toBe(false)
  })
})
