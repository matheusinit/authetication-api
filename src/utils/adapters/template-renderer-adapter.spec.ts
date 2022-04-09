import path from 'path'
import fs from 'fs'
import handlebars from 'handlebars'
import { TemplateRendererAdapter } from './template-renderer-adapter'

const baseDir = path.join(__dirname, 'views')

describe('TemplateRenderer Adapter', () => {
  it('Should define base directory', () => {
    const baseDir = path.join(__dirname, 'views')
    const sut = new TemplateRendererAdapter({ baseDir })

    sut.render('test')

    expect(sut.options.baseDir).toBeTruthy()
    expect(sut.options.baseDir).toBe(baseDir)
  })

  it('Should have .handlebars as default for extension name', () => {
    const sut = new TemplateRendererAdapter({ baseDir })

    sut.render('test')

    expect(sut.options.ext).toBe('.handlebars')
  })

  it('Can define a new extension name', () => {
    const ext = '.hbs'
    const sut = new TemplateRendererAdapter({ baseDir, ext })

    sut.render('test')

    expect(sut.options.ext).toBe('.hbs')
  })

  it('Should return html rendered from template', () => {
    const sut = new TemplateRendererAdapter({ baseDir })

    const template = fs.readFileSync(path.join(baseDir, 'test' + '.handlebars'), 'utf-8').toString()

    const renderTemplate = handlebars.compile(template)
    const htmlRendered = renderTemplate({ variable: 'Test' })

    const html = sut.render('test', { variable: 'Test' })

    expect(html).toBeTruthy()
    expect(html).toBe(htmlRendered)
  })
})
