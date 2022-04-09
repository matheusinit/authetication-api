import path from 'path'
import { TemplateRendererAdapter } from './template-renderer-adapter'

describe('TemplateRenderer Adapter', () => {
  it('Should define base directory', () => {
    const baseDir = path.join(__dirname, 'views')
    const sut = new TemplateRendererAdapter({ baseDir })

    sut.render('test')

    expect(sut.options.baseDir).toBeTruthy()
    expect(sut.options.baseDir).toBe(baseDir)
  })
})
