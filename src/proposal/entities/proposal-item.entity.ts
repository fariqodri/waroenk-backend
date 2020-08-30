import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "proposalItem" })
export class ProposalItem {

  @PrimaryColumn()
  id: String

  @Column()
  type: string

  @Column()
  item: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @Column({ default: true })
  is_active: boolean
}