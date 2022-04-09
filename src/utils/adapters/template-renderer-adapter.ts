import { TemplateOptions, TemplateRenderer } from '../../infra/mail/protocols/template-renderer'

export class TemplateRendererAdapter implements TemplateRenderer {
  readonly options: TemplateOptions

  constructor (options: TemplateOptions) {
    this.options = options
  }

  render (templateName: string, context?: any): string {
    return ''
  }
}
