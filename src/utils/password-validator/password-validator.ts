import { PasswordValidator } from '../../presentation/protocols/password-validator'

class Validator implements PasswordValidator {
  isValid (password: string): boolean {
    const re = /(?=(.*[a-z]){5,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[.!@#$%&_]){1,}).{8,}/
    const match = password.match(re)
    return match != null
  }
}

export const passwordValidator = new Validator()
