import { TokenValidator } from '../protocols/token-validator'
import { AuthenticationMiddleware } from './authentication-middleware'

describe('Authentication Middleware', () => {
  it('Should call TokenValidator with correct token', async () => {
    class TokenValidatorStub implements TokenValidator {
      async verify (token: string): Promise<boolean> {
        return true
      }
    }
    const tokenValidatorStub = new TokenValidatorStub()
    const sut = new AuthenticationMiddleware(tokenValidatorStub)
    const verifySpy = jest.spyOn(tokenValidatorStub, 'verify')
    const httpRequest = {
      token: 'any_token'
    }
    await sut.handle(httpRequest)
    expect(verifySpy).toHaveBeenCalledWith('any_token')
  })
})
