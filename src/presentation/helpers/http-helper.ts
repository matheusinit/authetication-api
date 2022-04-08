import { ServerError } from '../errors'
import { UnauthenticatedError } from '../errors/unauthenticated-error'
import { HttpResponse } from '../protocols/http'
import { appError } from './error-helper'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: appError(error)
})

export const unauthenticated = (): HttpResponse => ({
  statusCode: 401,
  body: appError(new UnauthenticatedError())
})

export const notFound = (error: Error): HttpResponse => ({
  statusCode: 404,
  body: appError(error)
})

export const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: appError(new ServerError())
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})
