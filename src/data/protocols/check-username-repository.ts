export interface CheckUsernameRepository {
  checkUsername: (username: string) => Promise<boolean>
}
