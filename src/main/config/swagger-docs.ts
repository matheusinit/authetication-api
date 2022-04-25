import { Express } from 'express'
import { serve, setup } from 'swagger-ui-express'
import swaggerJson from '../../../swagger.json'

export default (app: Express): void => {
  app.use('/api-docs', serve, setup(swaggerJson))
}
