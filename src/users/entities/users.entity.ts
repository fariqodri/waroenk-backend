import {Entity, PrimaryColumn, Column} from "typeorm";
import { Exclude } from 'class-transformer'

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryColumn()
  id: string

  @Column()
  full_name: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column()
  role: string

  @Exclude()
  password: string
}