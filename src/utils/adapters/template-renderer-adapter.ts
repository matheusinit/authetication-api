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
    return ''
  }
}
