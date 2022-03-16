import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from './../config/app'

describe('SignUp Routes', () => {
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

  it('Should return an account on success', async () => {
    await request(app).post('/api/signup').send({
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123',
      passwordConfirmation: 'senha123'
    }).expect(200)
  })
})
