export interface CheckEmailRepository {
  checkEmail: (email: string) => Promise<boolean>
}
