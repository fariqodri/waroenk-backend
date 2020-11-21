export class FaqQuery {
  limit: number
  page: number
  search?: string
}

export class LocationQuery {
  type: string
  search?: string
  province?: string
  city?: string
  district?: string
}

export class SponsorParam {
  image: string
  type: "slider" | "sponsor"
  size: number
}