import { Entity, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { UserEntity } from './users.entity';

@Entity({ name: "user_recovery" })
export class UserRecovery {
  @PrimaryColumn()
  otp: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity
}