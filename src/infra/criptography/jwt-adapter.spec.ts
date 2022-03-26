import env from './../../main/config/env'
import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

describe('Jwt Adapter', () => {
  describe('generate()', () => {
    it('Should call Jwt with correct values', () => {
      const sut = new JwtAdapter()
      const signSpy = jest.spyOn(jwt, 'sign')
      const payload = {
        id: 'any_id',
        email: 'any_email@mail.com'
      }
      sut.generate(payload)
      expect(signSpy).toHaveBeenCalledWith(payload, env.secret)
    })
  })
})
