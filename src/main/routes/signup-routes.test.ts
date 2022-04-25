import { Collection } from 'mongodb'
import request from 'supertest'
import { UnavailableEmailError } from '../../data/errors/unavailable-email-error'
import { UnavailableUsernameError } from '../../data/errors/unavailable-username-error'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import { InvalidParamError } from '../../presentation/errors'
import { appError } from '../../presentation/helpers/error-helper'
import app from './../config/app'

let accountCollection: Collection

describe('SignUp Routes', () => {
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
    const response = await request(app).post('/api/signup').send({
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    })

    expect(response.status).toBe(200)

    expect(response.body.id).toBeTruthy()
    expect(response.body.username).toBe('Matheus Oliveira')
    expect(response.body.email).toBe('matheus.oliveira@gmail.com')
    expect(response.body.password).toBeTruthy()
  })

  it('Should return a bad request error if username is unavailable', async () => {
    const fakeAccount = {
      username: 'Matheus Silva',
      email: 'matheus.silva@gmail.com',
      password: 'senha123',
      status: 'inactive'
    }

    await accountCollection.insertOne(fakeAccount)

    const response = await request(app).post('/api/signup').send({
      username: 'Matheus Silva',
      email: 'matheus.silva@gmail.com',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(appError(new UnavailableUsernameError()))
  })

  it('Should return a bad request error if email is unavailable', async () => {
    const fakeAccount = {
      username: 'Matheus Silva',
      email: 'matheus.silva@gmail.com',
      password: 'senha123',
      status: 'inactive'
    }

    await accountCollection.insertOne(fakeAccount)

    const response = await request(app).post('/api/signup').send({
      username: 'Matheus Oliveira',
      email: 'matheus.silva@gmail.com',
      password: 'Senhaa.123',
      passwordConfirmation: 'Senhaa.123'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(appError(new UnavailableEmailError()))
  })

  it('Should return a bad request error if password is invalid', async () => {
    const response = await request(app).post('/api/signup').send({
      username: 'Matheus Silva',
      email: 'matheus.silva@gmail.com',
      password: 'senha123',
      passwordConfirmation: 'senha123'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual(appError(new InvalidParamError('password')))
  })
})
