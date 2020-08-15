import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Exclude } from 'class-transformer';
import { DiscussionEntity } from "../../discussion/entities/discussion.entity";
import { AgendaEntity } from "../../agenda/entities/agenda.entity";
import { ProposalEntity } from "../../proposal/entities/proposal.entity";
import { CartEntity } from "../../order/entities/cart.entity";
import { OrderEntity } from "../../order/entities/order.entity";
import { ChatRoomEntity } from "../../chat/entities/chat-room.entity";

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

  @Column({ nullable: true, default: null })
  device_token?: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: true })
  is_active: boolean

  @OneToMany(type => DiscussionEntity, discussion => discussion.user)
  discussions?: DiscussionEntity[]

  @OneToMany(type => CartEntity, cart => cart.user)
  carts?: CartEntity[]

  @OneToMany(type => OrderEntity, order => order.user)
  orders?: OrderEntity[]

  @OneToMany(type => ChatRoomEntity, room => room.buyer)
  chats_as_buyer?: ChatRoomEntity[]

  @OneToMany(type => ChatRoomEntity, room => room.seller)
  chats_as_seller?: ChatRoomEntity[]

  @ManyToMany(type => AgendaEntity, agenda => agenda.users, { eager: true })
  @JoinTable()
  savedAgendas?: AgendaEntity[]
  
  @OneToMany(type => ProposalEntity, proposal => proposal.user)
  proposals?: ProposalEntity[]
}