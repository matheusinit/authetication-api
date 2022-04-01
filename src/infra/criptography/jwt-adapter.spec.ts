import env from './../../main/config/env'
import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

jest.mock('jsonwebtoken', () => ({
  sign (payload: any, secretOrPrivateKey: string): string {
    return 'any_token'
  },

  verify (token: string, secretOrPrivateKey: string): any {
    return 'any_data'
  }
}))

const makeSut = (): JwtAdapter => {
  return new JwtAdapter()
}

describe('Jwt Adapter', () => {
  describe('generate()', () => {
    it('Should call Jwt with correct values', () => {
      const sut = makeSut()
      const signSpy = jest.spyOn(jwt, 'sign')
      const payload = {
        id: 'any_id',
        email: 'any_email@mail.com'
      }
      sut.generate(payload)
      expect(signSpy).toHaveBeenCalledWith(payload, env.secret)
    })

    it('Should return a token on success', () => {
      const sut = makeSut()
      const payload = {
        id: 'any_id',
        email: 'any_email@mail.com'
      }
      const token = sut.generate(payload)
      expect(token).toBeTruthy()
    })
  })

  describe('verify()', () => {
    it('Should call Jwt with correct values', async () => {
      const sut = makeSut()
      const verifySpy = jest.spyOn(jwt, 'verify')
      await sut.verify('any_token')
      expect(verifySpy).toHaveBeenCalledWith('any_token', env.secret)
    })

    it('Should return false if token is not valid', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })
      const isValid = await sut.verify('any_token')
      expect(isValid).toBe(false)
    })

    it('Should return true if token is valid', async () => {
      const sut = makeSut()
      const isValid = await sut.verify('any_token')
      expect(isValid).toBe(true)
    })
  })
})
