import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from './../config/app'
import bcrypt from 'bcrypt'

let accountCollection: Collection

describe('ResetPassword Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  it('Should return an account on success', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'active'
    }
    await accountCollection.insertOne(fakeAccount)

    await request(app).put('/api/account/reset-password').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    }).expect(200)
  })

  it('Should return a bad request if email is invalid', async () => {
    await request(app).put('/api/account/reset-password').send({
      email: 'matheus.oliveira',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    }).expect(400)
  })

  it('Should return a bad request if password is invalid', async () => {
    await request(app).put('/api/account/reset-password').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'Senha',
      passwordConfirmation: 'Senha'
    }).expect(400)
  })

  it('Should return a bad request if email is not registered', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'active'
    }
    await accountCollection.insertOne(fakeAccount)

    await request(app).put('/api/account/reset-password').send({
      email: 'matheus.oliveira1@gmail.com',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    }).expect(400)
  })
})
