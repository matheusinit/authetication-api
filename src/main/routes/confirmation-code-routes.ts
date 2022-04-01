import { Router } from 'express'
import { adaptRoute } from '../adapters/express-route-adapter'
import { makeSendConfirmationCodeController } from '../factories/send-confirmation-code'
import { auth } from '../middlewares/authentication'

export default (router: Router): void => {
  router.post('/account/confirmation', auth, adaptRoute(makeSendConfirmationCodeController()))
}
