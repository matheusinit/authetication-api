import { ConfirmationCode } from '../../domain/models/confirmation-code'

export interface LoadConfirmationCodeByEmailRepository {
  loadByEmail: (email: string) => Promise<ConfirmationCode>
}
