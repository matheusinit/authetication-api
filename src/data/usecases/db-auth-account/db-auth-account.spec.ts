import { TokenGenerator } from '../../protocols/token-generator'
import { DbAuthAccount } from './db-auth-account'

interface SutTypes {
  sut: DbAuthAccount
  tokenGeneratorStub: TokenGenerator
}

const makeTokenGeneratorStub = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    generate (payload: any): string {
      return 'any_token'
    }
  }

  return new TokenGeneratorStub()
}

const makeSut = (): SutTypes => {
  const tokenGeneratorStub = makeTokenGeneratorStub()
  const sut = new DbAuthAccount(tokenGeneratorStub)
  return {
    sut,
    tokenGeneratorStub
  }
}

describe('DbAuthAccount', () => {
  it('Should call TokenGenerator with correct values', async () => {
    const { sut, tokenGeneratorStub } = makeSut()
    const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate')
    const accountInfo = {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
    await sut.auth(accountInfo)
    expect(generateSpy).toHaveBeenCalledWith({
      id: 'valid_id',
      email: 'any_email@mail.com'
    })
  })
})
