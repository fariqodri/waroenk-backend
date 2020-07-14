import * as jf from 'joiful';

export class DiscussionPostParam {

    @jf.string().optional()
    parentId: string
  
    @jf.string().required()
    productId: string
  
    @jf.string().required()
    title: string
  
    @jf.string().required()
    description: string
  
    @jf.array().required()
    images: string[]
    
  }