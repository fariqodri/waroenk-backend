export class ResponseBody<T> {
  public message: string
  public result: T | T[]

  constructor(result: T | T[], message: string = "ok") {
    this.message = message
    this.result = result
  }
}

export class ResponseListBody<T> {
  public message: string
  public result: T | T[]
  public page: number
  public limit: number

  constructor(result: T | T[], message: string = "ok", page: number = 0, limit: number = 0) {
    this.message = message
    this.result = result
    this.page = page
    this.limit = limit
  }
}