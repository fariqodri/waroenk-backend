import * as jf from 'joiful';

export class ShopProductQuery {
  limit: number
  page: number
  
  search?: string
  categories?: string
}

export class SellerBankParam {
  @jf.string().required()
  bank: string

  @jf.string().required()
  number: string

  @jf.string().required()
  owner: string
}

export class EditSellerBankParam {
  bank?: string
  number?: string
  owner?: string
}

export class ProductCreateParam {
  @jf.string().required()
  categoryId: string

  @jf.string().required()
  name: string

  @jf.number().required()
  price_per_quantity: number

  @jf.number().optional()
  discount: number

  @jf.string().required()
  description: string

  @jf.array().required()
  images: string[]

  @jf.boolean().required()
  available: boolean
}

export class ProductEditParam {
  categoryId?: string
  name?: string
  price_per_quantity?: number
  discount?: number
  description?: string
  images?: string[]
  available?: boolean
}

export class ShopPostParam {
  @jf.string().required()
  shop_name: string

  @jf.string().optional()
  description: string

  @jf.string().required()
  shop_address: string

  @jf.string().required()
  birth_date: string

  @jf.string().required()
  birth_place: string

  @jf.string().required()
  gender: string

  @jf.string().required()
  image: string

  @jf.array().optional()
  proposed_category: string[]
}