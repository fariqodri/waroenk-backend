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
  seller: {
    id: string;
    name: string;
    address: string;
    image: string;
    is_active: boolean;
    tier: number;
  };
  discount: number;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
    image: string;
  };
}
