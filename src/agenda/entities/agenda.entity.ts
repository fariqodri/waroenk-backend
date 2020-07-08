import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "agendas" })
export class AgendaEntity {

  @PrimaryColumn()
  id: string

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  location: string

  @Column()
  date: string

  @Column('simple-array')
  images: string[]

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: true })
  is_active: boolean
}