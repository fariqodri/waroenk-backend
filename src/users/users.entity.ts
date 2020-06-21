import { Exclude } from 'class-transformer'

/**
 * TODO add decorators for table
 */
export class UserEntity {
  id: string
  full_name: string
  email: string
  phone: string

  @Exclude()
  password: string
}