import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Collection } from 'mongodb'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'
import env from '../config/env'

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
    const { insertedId: id } = await collection.insertOne(fakeAccount)

    const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

    await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
      email: 'matheus.oliveira@gmail.com'
    }).expect(200)
  }, 60000)

  it('Should return a bad request if email is not registered', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'inactive'
    }
    const { insertedId: id } = await collection.insertOne(fakeAccount)

    const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

    await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
      email: 'matheus.oliveira1@gmail.com'
    }).expect(400)
  })

  it('Should return a bad request if account is already active', async () => {
    const fakeAccount = {
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: await bcrypt.hash('senha123', 12),
      status: 'active'
    }
    const { insertedId: id } = await collection.insertOne(fakeAccount)

    const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

    await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
      email: 'matheus.oliveira@gmail.com'
    }).expect(400)
  })

  it('Should return a unauthorized if authentication token is not provided', async () => {
    await request(app).post('/api/account/confirmation').send({
      email: 'matheus.oliveira@gmai.com'
    }).expect(401)
  })
})
