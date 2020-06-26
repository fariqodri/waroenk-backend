import * as jf from 'joiful';

export class LoginDto {
  @jf.string().email().required()
  email: string
  
  @jf.string().required()
  password: string
}
