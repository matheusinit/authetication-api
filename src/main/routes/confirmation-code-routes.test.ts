import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Collection } from 'mongodb'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'
import env from '../config/env'
import { appError } from '../../presentation/helpers/error-helper'
import { NotFoundError } from '../../data/errors/not-found-error'
import { AccountError } from '../../data/errors/account-error'
import { UnauthenticatedError } from '../../presentation/errors/unauthenticated-error'
import { InvalidParamError, MissingParamError } from '../../presentation/errors'
import { InvalidConfirmationCodeError } from '../../data/errors/invalid-confirmation-code-error'

let accountCollection: Collection
let confirmationCodeCollection: Collection

describe('ConfirmationCode Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})

    confirmationCodeCollection = MongoHelper.getCollection('confirmation-code')
    await confirmationCodeCollection.deleteMany({})
  })

  describe('Send confirmation code', () => {
    it('Should return a message on success', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com'
      })

      expect(response.status).toBe(200)
      expect(response.body.message).toBeTruthy()
    }, 80000)

    it('Should return a bad request if email is not registered', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira1@gmail.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new NotFoundError('email')))
    })

    it('Should return a bad request if account is already active', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new AccountError('Account is already active', 'AccountIsActiveError')))
    })

    it('Should return a unauthorized if authentication token is not provided', async () => {
      const response = await request(app).post('/api/account/confirmation').send({
        email: 'matheus.oliveira@gmai.com'
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual(appError(new UnauthenticatedError()))
    })

    it('Should return an unauthorized if authentication token is invalid', async () => {
      const token = jwt.sign({ id: 'valid_id', email: 'any_email' }, 'any_secret')

      const response = await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmai.com'
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual(appError(new UnauthenticatedError()))
    })
  })

  describe('Activate account by confirmation code', () => {
    it('Should return 200 on success', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const fakeConfirmationCode = {
        code: '765D6E85',
        createdAt: new Date()
      }

      const { insertedId: codeId } = await confirmationCodeCollection.insertOne(fakeConfirmationCode)

      await accountCollection.findOneAndUpdate({ email: 'matheus.oliveira@gmail.com' }, { $set: { code_id: codeId } })

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      })

      expect(response.status).toBe(200)

      expect(response.body.id).toBeTruthy()
      expect(response.body.username).toBe('Matheus Oliveira')
      expect(response.body.email).toBe('matheus.oliveira@gmail.com')
      expect(response.body.password).toBeTruthy()
      expect(response.body.status).toBe('active')
    })

    it('Should return 400 if email is not provided', async () => {
      const token = jwt.sign({ id: '6258ca0f7a2ba94a00fa0e0c', email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        code: '765D6E85'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new MissingParamError('email')))
    })

    it('Should return 400 if confirmation code is not provided', async () => {
      const token = jwt.sign({ id: '6258ca0f7a2ba94a00fa0e0c', email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new MissingParamError('confirmation code')))
    })

    it('Should return 400 if email is invalid', async () => {
      const token = jwt.sign({ id: '6258ca0f7a2ba94a00fa0e0c', email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira',
        code: '765D6E85'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidParamError('email')))
    })

    it('Should return 404 if email is not registered', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const fakeConfirmationCode = {
        code: '765D6E85',
        createdAt: new Date()
      }

      const { insertedId: codeId } = await confirmationCodeCollection.insertOne(fakeConfirmationCode)

      await accountCollection.findOneAndUpdate({ email: 'matheus.oliveira@gmail.com' }, { $set: { code_id: codeId } })

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira1@gmail.com',
        code: '765D6E85'
      })

      expect(response.status).toBe(404)
      expect(response.body).toEqual(appError(new NotFoundError('email')))
    })

    it('Should return 400 if account is already active', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'active'
      }

      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const fakeConfirmationCode = {
        code: '765D6E85',
        createdAt: new Date()
      }

      const { insertedId: codeId } = await confirmationCodeCollection.insertOne(fakeConfirmationCode)

      await accountCollection.findOneAndUpdate({ email: 'matheus.oliveira@gmail.com' }, { $set: { code_id: codeId } })

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new AccountError('Account is already active', 'AccountIsActiveError')))
    })

    it('Should return 404 if confirmation code is not found', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }

      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      })

      expect(response.status).toBe(404)
      expect(response.body).toEqual(appError(new NotFoundError('confirmationCode')))
    })

    it('Should return 400 if confirmation code has passed of its lifetime', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const confirmationCodeCreatedAt = new Date()
      confirmationCodeCreatedAt.setHours(confirmationCodeCreatedAt.getHours() - 6)
      confirmationCodeCreatedAt.setMinutes(confirmationCodeCreatedAt.getMinutes() - 1)

      const fakeConfirmationCode = {
        code: '765D6E85',
        createdAt: confirmationCodeCreatedAt
      }

      const { insertedId: codeId } = await confirmationCodeCollection.insertOne(fakeConfirmationCode)

      await accountCollection.findOneAndUpdate({ email: 'matheus.oliveira@gmail.com' }, { $set: { code_id: codeId } })

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidConfirmationCodeError('Confirmation Code has passed of its lifetime')))
    })

    it('Should return 400 if confirmation code does not match', async () => {
      const fakeAccount = {
        username: 'Matheus Oliveira',
        email: 'matheus.oliveira@gmail.com',
        password: await bcrypt.hash('senha123', 12),
        status: 'inactive'
      }
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

      const confirmationCodeCreatedAt = new Date()
      confirmationCodeCreatedAt.setHours(confirmationCodeCreatedAt.getHours() - 6)
      confirmationCodeCreatedAt.setMinutes(confirmationCodeCreatedAt.getMinutes() + 1)

      const fakeConfirmationCode = {
        code: '765D6E85',
        createdAt: confirmationCodeCreatedAt
      }

      const { insertedId: codeId } = await confirmationCodeCollection.insertOne(fakeConfirmationCode)

      await accountCollection.findOneAndUpdate({ email: 'matheus.oliveira@gmail.com' }, { $set: { code_id: codeId } })

      const token = jwt.sign({ id, email: 'matheus.oliveira@gmail.com' }, env.secret)

      const response = await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '149E0DC3'
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual(appError(new InvalidConfirmationCodeError('Invalid Confirmation Code')))
    })
  })
})
