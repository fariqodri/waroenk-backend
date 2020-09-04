import * as jf from 'joiful'

export class PostBody {
  @jf.string().required()
  title: string

  @jf.string().required()
  content: string

  @jf.string().optional()
  image: string
}

export class GetPostQuery {
  page: number
  limit: number
  sort: 'latest' | 'oldest'
}
