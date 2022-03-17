export interface CheckUsernameRepository {
  check: (username: string) => Promise<boolean>
}
