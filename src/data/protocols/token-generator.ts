export interface TokenGenerator {
  generate: (payload: any) => string
}
