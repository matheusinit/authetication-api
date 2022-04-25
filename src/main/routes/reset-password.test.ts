import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from './../config/app'
import bcrypt from 'bcrypt'
import { appError } from '../../presentation/helpers/error-helper'
import { InvalidParamError } from '../../presentation/errors'
import { NotFoundError } from '../../data/errors/not-found-error'
import { AccountError } from '../../data/errors/account-error'

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

  const token: string = '2956a3af7cd0745be89cc8b506d95215304143d9341275092b59cc49597f7545a488f1d0b7e21a7e8515be15aed1d3c6'

  describe('Reset password', () => {
    it('Should return an account on success', async () => {
      const tokenCreatedAt = new Date()
      tokenCreatedAt.setMilliseconds(0)

      tokenCreatedAt.setHours(tokenCreatedAt.getHours() - 5)

      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        token,
        tokenCreatedAt,
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }
      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).put('/api/account/reset-password').send({
        token,
        password: 'Senhaa.123',
        passwordConfirmation: 'Senhaa.123'
      })

      expect(response.status).toBe(200)

      expect(response.body.id).toBeTruthy()
      expect(response.body.username).toBe('Matheus Oliveira')
      expect(response.body.email).toBe('matheus.oliveira@gmail.com')
      expect(response.body.password).toBeTruthy()
      expect(response.body.status).toBe('active')
    })

    it('Should return a bad request if password is invalid', async () => {
      const response = await request(app).put('/api/account/reset-password').send({
        token,
        password: 'Senha',
        passwordConfirmation: 'Senha'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidParamError('password')))
    })

    it('Should return a bad request if token is not registered', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        token,
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }
      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).put('/api/account/reset-password').send({
        token: '2a8hab',
        password: 'Senhaa.123',
        passwordConfirmation: 'Senhaa.123'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new NotFoundError('token')))
    })

    it('Should return an bad request if account is inactive', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        token,
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }

      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).put('/api/account/reset-password').send({
        token,
        password: 'Senhaa.123',
        passwordConfirmation: 'Senhaa.123'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new AccountError('Account is inactive', 'AccountIsInactiveError')))
    })

    it('Should return a bad request if token is invalid', async () => {
      const tokenCreatedAt = new Date()

      tokenCreatedAt.setMilliseconds(0)
      tokenCreatedAt.setHours(tokenCreatedAt.getHours() - 24)

      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        token,
        tokenCreatedAt,
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }
      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).put('/api/account/reset-password').send({
        token,
        password: 'Senhaa.123',
        passwordConfirmation: 'Senhaa.123'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidParamError('token')))
    })
  })

  describe('Send email with reset password token', () => {
    it('Should return ok on success', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }

      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).post('/api/account/reset-password-token').send({
        email: 'matheus.oliveira@gmail.com'
      })

      expect(response.status).toBe(200)
      expect(response.body.message).toBeTruthy()
    }, 60000)

    it('Should return bad request if email is invalid', async () => {
      const response = await request(app).post('/api/account/reset-password-token').send({
        email: 'matheus.oliveira'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidParamError('email')))
    })

    it('Should return bad request if email is not registered', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }

      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).post('/api/account/reset-password-token').send({
        email: 'matheus.oliveira1@gmail.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new NotFoundError('email')))
    })

    it('Should return bad request if account is inactive', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }

      await accountCollection.insertOne(fakeAccount)

      const response = await request(app).post('/api/account/reset-password-token').send({
        email: 'matheus.oliveira@gmail.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new AccountError('Account is inactive', 'AccountIsInactiveError')))
    })
  })
})
