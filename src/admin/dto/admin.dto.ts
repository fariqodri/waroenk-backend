export class ListBuyersQuery {
  page: number;
  limit: number;
  sort_by: 'created' | 'name';
  order: 'asc' | 'desc';
  active?: 1 | 0;
  name?: string;
}
