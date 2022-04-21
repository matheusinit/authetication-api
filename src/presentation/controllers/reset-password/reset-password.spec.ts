import { InvalidParamError, ServerError } from '../../errors'
import { MissingParamError } from '../../errors/missing-param-error'
import { appError } from '../../helpers/error-helper'
import { ResetPasswordController } from './reset-password'
import { EmailValidator } from '../../protocols/email-validator'
import { PasswordValidator } from '../../protocols/password-validator'
import { InvalidPasswordError } from '../../errors/invalid-password-error'
import { ResetPassword } from '../../../domain/usecases/reset-password'
import { AccountModel } from '../signup/signup-protocols'
import { EmailNotRegisteredError } from '../../../data/errors/email-not-registered-error'
import { AccountError } from '../../../data/errors/account-error'

interface SutTypes {
  sut: ResetPasswordController
  emailValidatorStub: EmailValidator
  passwordValidatorStub: PasswordValidator
  resetPasswordStub: ResetPassword
}

const makeResetPasswordStub = (): ResetPassword => {
  class ResetPasswordStub implements ResetPassword {
    async reset (email: string, password: string): Promise<AccountModel> {
      return {
        id: 'any_id',
        username: 'any_username',
        email: 'any_email',
        password: 'hashed_password',
        status: 'active'
      }
    }
  }
  return new ResetPasswordStub()
}

const makePasswordValidatorStub = (): PasswordValidator => {
  class PasswordValidatorStub implements PasswordValidator {
    isValid (password: string): boolean {
      return true
    }
  }
  return new PasswordValidatorStub()
}

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeSut = (): SutTypes => {
  const resetPasswordStub = makeResetPasswordStub()
  const passwordValidatorStub = makePasswordValidatorStub()
  const emailValidatorStub = makeEmailValidatorStub()
  const sut = new ResetPasswordController(emailValidatorStub, passwordValidatorStub, resetPasswordStub)

  return {
    sut,
    emailValidatorStub,
    passwordValidatorStub,
    resetPasswordStub
  }
}

describe('ResetPassword Controller', () => {
  it('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('email')))
  })

  it('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('password')))
  })

  it('Should return 400 if no password confirmation is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new MissingParamError('passwordConfirmation')))
  })

  it('Should return 400 if password is not equal to password confirmation', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'another_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('passwordConfirmation')))
  })

  it('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    await sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  it('Should return 500 if EmailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 400 if EmailValidator returns false', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidParamError('email')))
  })

  it('Should call PasswordValidator with correct password', async () => {
    const { sut, passwordValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(passwordValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    await sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('any_password')
  })

  it('Should return 500 if PasswordValidator throws', async () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 400 if PasswordValidator returns false', async () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'invalid_password',
        passwordConfirmation: 'invalid_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new InvalidPasswordError()))
  })

  it('Should call ResetPassword with correct values', async () => {
    const { sut, resetPasswordStub } = makeSut()
    const resetSpy = jest.spyOn(resetPasswordStub, 'reset')
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    await sut.handle(httpRequest)

    expect(resetSpy).toHaveBeenCalledWith('any_email@email.com', 'any_password')
  })

  it('Should return 500 if ResetPassword throws', async () => {
    const { sut, resetPasswordStub } = makeSut()
    jest.spyOn(resetPasswordStub, 'reset').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(appError(new ServerError()))
  })

  it('Should return 400 if email provided is not registered', async () => {
    const { sut, resetPasswordStub } = makeSut()
    jest.spyOn(resetPasswordStub, 'reset').mockReturnValueOnce(new Promise((resolve, reject) => reject(new EmailNotRegisteredError())))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new EmailNotRegisteredError()))
  })

  it('Should return 400 if account is inactive', async () => {
    const { sut, resetPasswordStub } = makeSut()
    jest.spyOn(resetPasswordStub, 'reset').mockReturnValueOnce(new Promise((resolve, reject) => reject(new AccountError('Account is inactive', 'AccountIsInactiveError'))))
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(appError(new AccountError('Account is inactive', 'AccountIsInactiveError')))
  })

  it('Should return an account on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'any_id',
      username: 'any_username',
      email: 'any_email',
      password: 'hashed_password',
      status: 'active'
    })
  })
})
