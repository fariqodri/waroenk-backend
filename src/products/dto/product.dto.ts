export class ProductQuery {
  page: number
  limit: number

  sort_type?: string
  sort_by?: string
  search?: string
  price_from?: number
  price_to?: number
  categories?: string
  sellerId?: string
  sellerLocation?: string
}

export class ProductResponse {
  id: string;
  product_seller_user_id: string;
  name: string;
  price_per_quantity: number;
  seller: {
    id: string;
    shop_name: string;
    shop_address: string;
    description: string;
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
  is_my_product: boolean;
}
