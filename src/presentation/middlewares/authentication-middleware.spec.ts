import { TokenValidator } from '../protocols/token-validator'
import { AuthenticationMiddleware } from './authentication-middleware'

interface SutTypes {
  sut: AuthenticationMiddleware
  tokenValidatorStub: TokenValidator
}

const makeSut = (): SutTypes => {
  class TokenValidatorStub implements TokenValidator {
    async verify (token: string): Promise<boolean> {
      return true
    }
  }
  const tokenValidatorStub = new TokenValidatorStub()
  const sut = new AuthenticationMiddleware(tokenValidatorStub)

  return {
    sut,
    tokenValidatorStub
  }
}

describe('Authentication Middleware', () => {
  it('Should call TokenValidator with correct token', async () => {
    const { sut, tokenValidatorStub } = makeSut()
    const verifySpy = jest.spyOn(tokenValidatorStub, 'verify')
    const httpRequest = {
      token: 'any_token'
    }
    await sut.handle(httpRequest)
    expect(verifySpy).toHaveBeenCalledWith('any_token')
  })
})
