import { adaptMiddleware } from '../adapters/middleware-route-adapter'
import { makeAuthenticationMiddleware } from '../factories/authentication-middleware'

export const auth = adaptMiddleware(makeAuthenticationMiddleware())
