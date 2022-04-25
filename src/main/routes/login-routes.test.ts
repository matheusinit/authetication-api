import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from './../config/app'

import bcrypt from 'bcrypt'
import { appError } from '../../presentation/helpers/error-helper'
import { NotFoundError } from '../../data/errors/not-found-error'

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

    const response = await request(app).post('/api/login').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123'
    })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeTruthy()
  })

  it('Should return a bad request error if email is not registered', async () => {
    const response = await request(app).post('/api/login').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(appError(new NotFoundError('email')))
  })

  it('Should return a bad request error if password not match', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'inactive'
    }

    await collection.insertOne(fakeAccount)

    const response = await request(app).post('/api/login').send({
      email: 'matheus.oliveira@gmail.com',
      password: 'senha12'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(appError(new NotFoundError('password')))
  })
})
