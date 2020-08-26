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
