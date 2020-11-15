import { Entity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { UserEntity } from './users.entity';

@Entity({ name: "user_confirmation" })
export class UserConfirmation {
  @PrimaryColumn()
  code: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity
}