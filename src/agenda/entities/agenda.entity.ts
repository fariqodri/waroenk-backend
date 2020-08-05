import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";

@Entity({ name: "agendas" })
export class AgendaEntity {

  @PrimaryColumn()
  id: string

  @ManyToMany(type => UserEntity, user => user.savedAgendas)
  users?: UserEntity[]

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  location: string

  @Column()
  date: string

  @Column({ default: 'pelatihan' })
  type: 'pelatihan' | 'pembinaan'

  @Column('simple-array')
  images: string[]

  @Column('simple-array', { nullable: true })
  sponsors: string[]

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: true })
  is_active: boolean
}