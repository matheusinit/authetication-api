import { PasswordValidator } from '../../presentation/protocols/password-validator'
import { PasswordValidatorAdapter } from './password-validator-adapter'

const makePasswordValidatorStub = (): PasswordValidator => {
  class PasswordValidatorStub implements PasswordValidator {
    isValid (password: string): boolean {
      return true
    }
  }

  return new PasswordValidatorStub()
}

const makeSut = (): PasswordValidatorAdapter => {
  return new PasswordValidatorAdapter()
}

describe('PasswordValidator Adapter', () => {
  it('Should return false if validator returns false', () => {
    const sut = makeSut()
    const passwordValidatorStub = makePasswordValidatorStub()
    jest.spyOn(passwordValidatorStub, 'isValid').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid_password')
    expect(isValid).toBe(false)
  })
})
