import { HashGenerator } from '../../data/protocols/hash-generator'
import crypto from 'crypto'

export class Hasher implements HashGenerator {
  generate (): string {
    return crypto.randomBytes(48).toString('hex')
  }
}
