import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";

@Entity({ name: "faq" })
export class FaqEntity {

  @PrimaryColumn()
  id: string

  @Column()
  title: string

  @Column("text")
  description: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

}