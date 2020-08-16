export class AgendaQuery {
  limit: number
  page: number
  
  title?: string
  location?: string
  type?: string
  sort_type?: string
  date_from?: string
  date_to?: string
}

export class CreateAgendaParam {
  title: string
  description: string
  location: string
  date: string
  images: string[]
  type: 'pelatihan' | 'pembinaan'
  sponsors?: string[]
}