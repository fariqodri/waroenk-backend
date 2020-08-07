import * as jf from 'joiful';

export class CreateCartParam {
    @jf.string().required()
    productId: string

    @jf.number().required()
    quantity: number
  }