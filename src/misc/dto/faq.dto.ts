export class FaqQuery {
  limit: number
  page: number
  search?: string
}

export class LocationQuery {
  type: string
  province?: string
  city?: string
  district?: string
}