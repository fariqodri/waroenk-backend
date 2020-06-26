import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryColumn()
  id: string

  @Column()
  full_name: string

  @Column({ unique: true })
  email: string

  @Column()
  phone: string

  @Column()
  role: string

  @Exclude()
  @Column()
  password: string

}