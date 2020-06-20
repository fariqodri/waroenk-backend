export class ResponseBody<T> {
  public message: string
  public result: T | T[]

  constructor(result: T | T[], message: string = "ok") {
    this.message = message
    this.result = result
  }
}