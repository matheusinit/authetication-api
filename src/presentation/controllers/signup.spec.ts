import { SignUpController } from './signup'

describe('SignUp Controller', () => {
  it('Should return 400 if no username is provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        username: 'any_name',
        email: 'any_email',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
