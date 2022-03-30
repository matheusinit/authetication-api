import request from 'supertest'
import bcrypt from 'bcrypt'
import { Collection } from 'mongodb'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'

let collection: Collection

describe('ConfirmationCode Routes', () => {
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

  it('Should return a message on success', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'inactive'
    }
    await collection.insertOne(fakeAccount)

    await request(app).post('/api/account/confirmation').send({
      email: 'matheus.oliveira@gmail.com'
    }).expect(200)
  }, 60000)
})
