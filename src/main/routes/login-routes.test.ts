import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from './../config/app'

import bcrypt from 'bcrypt'

let collection: Collection

describe('Login Routes', () => {
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

  it('Should return a token on success', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'inactive'
    }
    await collection.insertOne(fakeAccount)

    await request(app).post('/api/login').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123'
    }).expect(200)
  })

  it('Should return a bad request error if email is not registered', async () => {
    await request(app).post('/api/login').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123'
    }).expect(400)
  })
})
