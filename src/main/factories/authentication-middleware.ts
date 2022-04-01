import { JwtAdapter } from '../../infra/criptography/jwt-adapter'
import { AuthenticationMiddleware } from '../../presentation/middlewares/authentication-middleware'

export const makeAuthenticationMiddleware = (): AuthenticationMiddleware => {
  const tokenValidator = new JwtAdapter()
  const authenticationMiddleware = new AuthenticationMiddleware(tokenValidator)
  return authenticationMiddleware
}
