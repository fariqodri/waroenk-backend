import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { ProposalData } from "./proposal-data.entity";

@Entity({ name: "proposal" })
export class ProposalEntity {

  @PrimaryColumn()
  id: string

  @OneToMany(type => ProposalData, data => data.proposal)
  data?: ProposalEntity[]

  @ManyToOne(type => UserEntity, user => user.proposals, { eager: true })
  user: UserEntity

  @Column()
  type: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @Column({ nullable: true })
  deleted_at: Date
}