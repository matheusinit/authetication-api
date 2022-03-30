export interface HttpResponse {
  statusCode: number
  body: any
}

export interface HttpRequest {
  token?: string
  body?: any
}
