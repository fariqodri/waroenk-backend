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
  userName: string
  userRole: string
  productId: string
  parentId: string
  parentUserName: string
  parentUserRole: string
  description: string
  created_at: Date
}