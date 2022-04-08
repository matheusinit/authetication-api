import { ServerError } from '../errors'
import { UnauthenticatedError } from '../errors/unauthenticated-error'
import { appError } from '../helpers/error-helper'
import { TokenValidator } from '../protocols/token-validator'
import { AuthenticationMiddleware } from './authentication-middleware'

interface SutTypes {
  sut: AuthenticationMiddleware
  tokenValidatorStub: TokenValidator
}

const makeTokenValidatorStub = (): TokenValidator => {
  class TokenValidatorStub implements TokenValidator {
    async verify (token: string): Promise<boolean> {
      return true
    }
  }
  return new TokenValidatorStub()
}

const makeSut = (): SutTypes => {
  const tokenValidatorStub = makeTokenValidatorStub()
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
      token: 'Berear: any_token'
    }
    await sut.handle(httpRequest)
    expect(verifySpy).toHaveBeenCalledWith('any_token')
  })

  it('Should return 500 if TokenValidator throws', async () => {
    const { sut, tokenValidatorStub } = makeSut()
    jest.spyOn(tokenValidatorStub, 'verify').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      token: 'any_token'
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 401 if token is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(appError(new UnauthenticatedError()))
  })

  it('Should return 401 if TokenValidator returns false', async () => {
    const { sut, tokenValidatorStub } = makeSut()
    jest.spyOn(tokenValidatorStub, 'verify').mockReturnValueOnce(new Promise((resolve, reject) => resolve(false)))
    const httpRequest = {
      token: 'any_token'
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(appError(new UnauthenticatedError()))
  })

  it('Should return undefined if TokenValidator returns true', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      token: 'any_token'
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toBe(undefined)
  })
})
