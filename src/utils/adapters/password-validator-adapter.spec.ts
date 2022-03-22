import { PasswordValidator } from '../../presentation/protocols/password-validator'
import { PasswordValidatorAdapter } from './password-validator-adapter'

class PasswordValidatorStub implements PasswordValidator {
  isValid (password: string): boolean {
    return true
  }
}

describe('PasswordValidator Adapter', () => {
  it('Should return false if validator returns false', () => {
    const sut = new PasswordValidatorAdapter()
    const passwordValidatorStub = new PasswordValidatorStub()
    jest.spyOn(passwordValidatorStub, 'isValid').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid_password')
    expect(isValid).toBe(false)
  })
})
