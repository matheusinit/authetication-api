import { Router } from 'express'
import { adaptRoute } from '../adapters/express-route-adapter'
import { makeResetPasswordController } from '../factories/reset-password'

export default (router: Router): void => {
  router.put('/account/reset-password', adaptRoute(makeResetPasswordController()))
}
