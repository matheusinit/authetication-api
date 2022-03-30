export interface TokenValidator {
  verify: (token: string) => Promise<boolean>
}
