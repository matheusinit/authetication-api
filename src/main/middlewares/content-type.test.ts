import request from 'supertest'
import app from '../config/app'

describe('Content Type Middleware', () => {
  it('Should return json as content type for default', async () => {
    app.get('/test_content_type', (request, response) => {
      response.send('')
    })

    await request(app).get('/test_content_type').expect('content-type', /json/)
  })

  it('Should return xml as content type when forced', async () => {
    app.get('/test_content_type_xml', (request, response) => {
      response.type('xml')
      response.send('')
    })

    await request(app).get('/test_content_type_xml').expect('content-type', /xml/)
  })
})
