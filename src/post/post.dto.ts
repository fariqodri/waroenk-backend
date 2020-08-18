import * as jf from 'joiful'

export class PostBody {
  @jf.string().required()
  title: string

  @jf.string().required()
  content: string
}
