import jwt from 'jsonwebtoken'
import env from './../../main/config/env'
import { TokenGenerator } from '../../data/protocols/token-generator'
import { TokenValidator } from '../../presentation/protocols/token-validator'

export class JwtAdapter implements TokenGenerator, TokenValidator {
  generate (payload: any): string {
    return jwt.sign(payload, env.secret)
  }

  async verify (token: string): Promise<boolean> {
    try {
      jwt.verify(token, process.env.SECRET)
      return true
    } catch (error) {
      return false
    }
  }
}
