import { Router } from 'express'

export default (router: Router): void => {
  router.get('/greeting', (request, response) => {
    response.send({ message: 'Hello World' })
  })

  router.get('/greeting/obi-wan', (request, response) => {
    response.send({ message: 'Hello There' })
  })
}
