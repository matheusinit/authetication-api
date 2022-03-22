import { PasswordValidator } from '../../presentation/protocols/password-validator'

class Validator implements PasswordValidator {
  isValid (password: string): boolean {
    return true
  }
}

export const passwordValidator = new Validator()
