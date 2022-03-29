import crypto from 'crypto'
import { CodeGenerator } from '../../data/protocols/code-generator'

export class Generator implements CodeGenerator {
  generate (): string {
    return crypto.randomBytes(4).toString('hex')
  }
}
