export interface StoreConfirmationCodeRepository {
  storeConfirmationCode: (confirmationCode: string, email: string) => Promise<void>
}
