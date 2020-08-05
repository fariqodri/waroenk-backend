import * as jf from 'joiful';

export class ProposalQuery {
  limit?: number
  page?: number
  id?: string
  type?: string
}

export class CreateProposalParam {
  @jf.array().required()
  data: any[]

  @jf.string().required()
  type: string
}