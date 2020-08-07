import * as jf from 'joiful';

export class CreateCartParam {
  @jf.string().required()
  productId: string

  @jf.number().required()
  quantity: number
}

export class CreateOrderParam {
  @jf.string().required()
  address: string
}