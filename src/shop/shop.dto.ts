import * as jf from 'joiful';

export class ShopProductQuery {
  limit: number
  page: number
  
  search?: string
}

export class ProductDeleteParam {
  id: string
}

export class ProductPostParam {
  @jf.string().required()
  categoryId: string

  @jf.string().required()
  name: string

  @jf.number().required()
  price_per_quantiy: number

  @jf.number().optional()
  discount: number

  @jf.string().required()
  description: string

  @jf.array().required()
  images: string[]

  @jf.boolean().required()
  available: boolean
}

export class ShopPostParam {
  @jf.string().required()
  shop_name: string

  @jf.string().required()
  shop_address: string

  @jf.string().required()
  birth_date: string

  @jf.string().required()
  birth_place: string

  @jf.string().required()
  gender: string

  @jf.string().optional()
  image: string

  @jf.string().required()
  location: string
}