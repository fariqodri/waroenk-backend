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

  @jf.string().required()
  recipient_name: string
  
  @jf.string().required()
  recipient_number: string
}

export class UpdateOrderParam {
  @jf.number().optional()
  fare: number

  @jf.string().optional()
  courier: string
  
  @jf.string().optional()
  notes: string

  @jf.string().optional()
  payment_proof: string

  @jf.string().optional()
  payment_bank: string
  
  @jf.string().optional()
  account_owner: string

  @jf.string().optional()
  account_number: string

  @jf.string().optional()
  receipt_number: string
}