import { NextFunction, Request, Response } from 'express'
import { HttpRequest } from '../../presentation/protocols'
import { Middleware } from '../../presentation/protocols/middleware'

export const adaptMiddleware = (middleware: Middleware) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const httpRequest: HttpRequest = {
      token: request.headers.authorization,
      body: request.body
    }

    const httpResponse = await middleware.handle(httpRequest)

    if (httpResponse) {
      return response.status(httpResponse.statusCode).json(httpResponse.body)
    }

    next()
  }
}
