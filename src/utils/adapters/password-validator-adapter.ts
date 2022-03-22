import { PasswordValidator } from '../../presentation/protocols/password-validator'

export class PasswordValidatorAdapter implements PasswordValidator {
  isValid (password: string): boolean {
    return false
  }
}
