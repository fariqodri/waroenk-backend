import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Exclude } from 'class-transformer';
import { DiscussionEntity } from "../../discussion/entities/discussion.entity";
import { AgendaEntity } from "../../agenda/entities/agenda.entity";

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
  role: 'buyer' | 'seller'

  @Exclude()
  @Column()
  password: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: true })
  is_active: boolean

  @OneToMany(type => DiscussionEntity, discussion => discussion.user)
  discussions?: DiscussionEntity[]

  @ManyToMany(type => AgendaEntity, agenda => agenda.users, { eager: true })
  @JoinTable()
  savedAgendas?: AgendaEntity[]
  
}