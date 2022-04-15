import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Collection } from 'mongodb'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import app from '../config/app'
import env from '../config/env'

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
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

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
      const { insertedId: id } = await accountCollection.insertOne(fakeAccount)

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

    it('Should return an unauthorized if authentication token is invalid', async () => {
      const token = jwt.sign({ id: 'valid_id', email: 'any_email' }, 'any_secret')

      await request(app).post('/api/account/confirmation').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmai.com'
      }).expect(401)
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

      await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      }).expect(200)
    })

    it('Should return 400 if email is not provided', async () => {
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

      await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        code: '765D6E85'
      }).expect(400)
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

      await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira1@gmail.com',
        code: '765D6E85'
      }).expect(404)
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

      await request(app).post('/api/account/activate').set('Authorization', `Bearer: ${token}`).send({
        email: 'matheus.oliveira@gmail.com',
        code: '765D6E85'
      }).expect(400)
    })
  })
})
