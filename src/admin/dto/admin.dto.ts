export class EditSellerParam {
  active?: boolean
  paid?: boolean
  blocked?: boolean
  tier?: 1 | 2
}

export class ListBuyersQuery {
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
  filter: 'none' | 'paid' | 'not_paid' | 'not_verified' | 'blocked'
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