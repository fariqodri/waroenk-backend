import * as jf from 'joiful';

export class DiscussionPostParam {
  @jf.string().optional()
  parentId: string
  
  @jf.string().required()
  productId: string
  
  @jf.string().required()
  description: string
}

export class DiscussionResponse {
  id: string
  userId: string
  productId: string
  parentId: string
  description: string
  created_at: Date
}