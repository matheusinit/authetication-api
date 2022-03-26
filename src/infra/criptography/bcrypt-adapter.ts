import bcrypt from 'bcrypt'

import { Encrypter } from '../../data/protocols/encrypter'
import { HashComparator } from '../../data/protocols/hash-comparator'

export class BcryptAdapter implements Encrypter, HashComparator {
  private readonly salt: number

  constructor (salt: number) {
    this.salt = salt
  }

  async encrypt (value: string): Promise<string> {
    const hash = await bcrypt.hash(value, this.salt)
    return hash
  }

  async compare (password: string, hash: string): Promise<boolean> {
    await bcrypt.compare(password, hash)
    return true
  }
}
