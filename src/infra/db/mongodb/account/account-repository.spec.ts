import { Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account-repository'

let collection: Collection

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    collection = MongoHelper.getCollection('accounts')
    await collection.deleteMany({})
  })

  const makeSut = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }

  describe('add()', () => {
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
  })

  describe('checkUsername()', () => {
    it('Should return true if username is available', async () => {
      const sut = makeSut()
      const isAvailable = await sut.checkUsername('available_username')
      expect(isAvailable).toBe(true)
    })

    it('Should return false if username is unavailable', async () => {
      const sut = makeSut()
      const fakeAccount = {
        username: 'unavailable_username',
        email: 'valid_email@email.com',
        password: 'hashed_password'
      }
      await collection.insertOne(fakeAccount)
      const isAvailable = await sut.checkUsername('unavailable_username')
      expect(isAvailable).toBe(false)
    })
  })

  describe('checkEmail()', () => {
    it('Should return true if email is available', async () => {
      const sut = makeSut()
      const isAvailable = await sut.checkEmail('available_email@mail.com')
      expect(isAvailable).toBe(true)
    })

    it('Should return false if email is unavailable', async () => {
      const sut = makeSut()
      const fakeAccount = {
        username: 'valid_username',
        email: 'unavailable_email@email.com',
        password: 'hashed_password'
      }
      await collection.insertOne(fakeAccount)
      const isAvailable = await sut.checkEmail('unavailable_email@email.com')
      expect(isAvailable).toBe(false)
    })
  })

  describe('loadByEmail()', () => {
    it('Should return an account on success', async () => {
      const sut = makeSut()
      const fakeAccount = {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'any_status'
      }
      await collection.insertOne(fakeAccount)

      const account = await sut.loadByEmail('any_email@mail.com')

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()
      expect(account.username).toBeTruthy()
      expect(account.email).toBeTruthy()
      expect(account.password).toBeTruthy()
      expect(account.status).toBeTruthy()
    })

    it('Should return null if account with email doest not exist', async () => {
      const sut = makeSut()
      const account = await sut.loadByEmail('email_not_registered@mail.com')
      expect(account).toBeFalsy()
    })
  })

  describe('update()', () => {
    it('Should update an account on success', async () => {
      const sut = makeSut()
      const fakeAccount = {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        status: 'any_status'
      }
      const { insertedId } = await collection.insertOne(fakeAccount)
      const id = insertedId as unknown as string

      const updatedAccount = await sut.update(id, { username: 'new_username' })

      expect(updatedAccount).toBeTruthy()
      expect(updatedAccount.username).toBe('new_username')
    })

    it('Should return null if account is not found', async () => {
      const sut = makeSut()

      const account = await sut.update('invalid_id', { username: 'new_username' })

      expect(account).toBeFalsy()
    })
  })
})
