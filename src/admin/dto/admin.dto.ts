export class EditSellerParam {
  active?: boolean
  tier?: 1 | 2
}

export class ListUsersQuery {
  page: number;
  limit: number;
  sort_by: 'created' | 'name';
  order: 'asc' | 'desc';
  active?: 1 | 0;
  name?: string;
}

export class ListSellerQuery {
  page: number
  limit: number
  filter: 'none' | 'verified' | 'not_verified' | 'category'
  category?: string
  sort_by: 'created' | 'name'
  order: 'asc' | 'desc'
  name?: string
}

export class ListProposalParam {
  page: number;
  limit: number;
  type?: string;
}

export class ListDiscussionParam {
  page: number;
  limit: number;
  search?: string;
}

export class CountOrderParam {
  dayFrom: number
  monthFrom: number
  yearFrom: number
  dayTo: number
  monthTo: number
  yearTo: number
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

export class EditAgendaParam {
  title?: string
  description?: string
  location?: string
  type?: 'pelatihan' | 'pembinaan'
  date?: string
  images?: string[]
  sponsors?: string[]
}

export class EditSellerCategoryParam {
  category: string
  expiry_date?: string
  status?: 'paid' | 'not_paid' | 'blocked'
}