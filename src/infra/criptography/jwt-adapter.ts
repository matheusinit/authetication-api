import jwt from 'jsonwebtoken'
import env from './../../main/config/env'
import { TokenGenerator } from '../../data/protocols/token-generator'

export class JwtAdapter implements TokenGenerator {
  generate (payload: any): string {
    jwt.sign(payload, env.secret)
    return null
  }
}
