import { Generator } from './code-generator'

describe('Code Generator', () => {
  it('Should return a string length of 8 characters', () => {
    const sut = new Generator()
    const re = /^[A-Za-z0-9]{8}/

    const code = sut.generateCode()

    expect(code).toMatch(re)
  })

  it('Should return only uppercase characters and numbers', () => {
    const sut = new Generator()
    const re = /^[A-Z0-9]+/

    const code = sut.generateCode()

    expect(code).toMatch(re)
  })
})
