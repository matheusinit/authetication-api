import { Router } from 'express'
import { adaptRoute } from '../adapters/express-route-adapter'
import { makeSendConfirmationCodeController } from '../factories/send-confirmation-code'

export default (router: Router): void => {
  router.post('/account/confirmation', adaptRoute(makeSendConfirmationCodeController()))
}
