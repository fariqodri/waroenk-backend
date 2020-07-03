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

  @jf.number().required()
  discount: number

  @jf.string().required()
  description: string

  @jf.array().required()
  images: string[]
}

