export interface TemplateOptions {
  baseDir: string
  ext?: string
}

export interface TemplateRenderer {
  readonly options: TemplateOptions
  render: (templateName: string, context?: any) => string
}
