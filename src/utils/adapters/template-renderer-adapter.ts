import path from 'path'
import fs from 'fs'
import handlebars from 'handlebars'

import { TemplateOptions, TemplateRenderer } from '../../infra/mail/protocols/template-renderer'

export class TemplateRendererAdapter implements TemplateRenderer {
  readonly options: TemplateOptions

  constructor ({ baseDir, ext }: TemplateOptions) {
    this.options = {
      baseDir,
      ext: ext ?? '.handlebars'
    }
  }

  render (templateName: string, context?: any): string {
    const { baseDir, ext } = this.options

    const templatePath = path.join(baseDir, templateName + ext)
    const template = fs.readFileSync(templatePath, 'utf-8').toString()
    const renderTemplate = handlebars.compile(template)

    return renderTemplate(context)
  }
}
