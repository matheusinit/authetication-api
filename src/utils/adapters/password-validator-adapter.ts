import { PasswordValidator } from '../../presentation/protocols/password-validator'
import { passwordValidator } from '../password-validator/password-validator'

export class PasswordValidatorAdapter implements PasswordValidator {
  isValid (password: string): boolean {
    passwordValidator.isValid(password)

    return false
  }
}
