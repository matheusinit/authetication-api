import request from 'supertest'
import app from './../config/app'

describe('SignUp Routes', () => {
  it('Should return an account on success', async () => {
    await request(app).post('/api/signup').send({
      username: 'Matheus Oliveira',
      email: 'matheus.oliveira@gmail.com',
      password: 'senha123',
      passwordConfirmation: 'senha123'
    }).expect(200)
  })
})
