import { TokenGenerator } from '../../protocols/token-generator'
import { DbAuthAccount } from './db-auth-account'

describe('DbAuthAccount', () => {
  it('Should call TokenGenerator with correct values', async () => {
    class TokenGeneratorStub implements TokenGenerator {
      generate (payload: any): string {
        return ''
      }
    }

    const tokenGeneratorStub = new TokenGeneratorStub()
    const sut = new DbAuthAccount(tokenGeneratorStub)
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
