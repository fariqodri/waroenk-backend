export class ProductQuery {
  page: number
  limit: number

  sort_type?: string
  sort_by?: string
  search?: string
  price_from?: number
  price_to?: number
  category?: string
}

export class ProductResponse {
  id: string;
  name: string;
  price_per_quantity: number;
  seller: string;
  discount: number;
  description: string;
  images: string[];
  category: string;
}
