import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { ProposalEntity } from "./proposal.entity";

@Entity({ name: "proposalData" })
export class ProposalData {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => ProposalEntity, proposal => proposal.data, { eager: true })
  proposal: ProposalEntity

  @Column()
  key: string

  @Column()
  value: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @Column({ nullable: true })
  deleted_at: Date
}