export class ProductQuery {
  page: number
  limit: number
  search?: string
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
