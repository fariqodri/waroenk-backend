export class FaqQuery {
  limit: number
  page: number
  search?: string
}

export class LocationQuery {
  type: string
  mode: string
  search?: string
  province?: string
  city?: string
  district?: string
}