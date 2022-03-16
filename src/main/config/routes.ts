import { Express, Router } from 'express'
import fg from 'fast-glob'

export default (app: Express): void => {
  const router = Router()
  app.use('/api', router)

  const routesFiles = fg.sync('**/src/main/routes/**routes.ts')
  routesFiles.map(async file => {
    const route = (await import(`../../../${file}`)).default
    route(router)
  })
}
