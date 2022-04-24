import { Router } from 'express'
import { adaptRoute } from '../adapters/express-route-adapter'
import { makeResetPasswordController } from '../factories/reset-password'
import { makeSendResetPasswordEmailController } from '../factories/send-reset-password-email'

export default (router: Router): void => {
  router.put('/account/reset-password', adaptRoute(makeResetPasswordController()))
  router.post('/account/reset-password-token', adaptRoute(makeSendResetPasswordEmailController()))
}
