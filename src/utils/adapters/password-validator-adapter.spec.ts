import { PasswordValidator } from '../../presentation/protocols/password-validator'
import { passwordValidator } from '../password-validator/password-validator'
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

  it('Should return true if validator returns true', () => {
    const sut = makeSut()
    const isValid = sut.isValid('Valid_password1')
    expect(isValid).toBe(true)
  })

  it('Should call PasswordValidator with correct password', () => {
    const sut = makeSut()
    const isValidSpy = jest.spyOn(passwordValidator, 'isValid')
    sut.isValid('any_password')
    expect(isValidSpy).toHaveBeenCalledWith('any_password')
  })
})
