import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, CreateDateColumn, Unique } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { ChatEntity } from "./chat.entity";

@Entity({ name: 'chat_rooms' })
@Unique(['buyer', 'seller'])
export class ChatRoomEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(type => UserEntity, user => user.chats_as_buyer)
  buyer: UserEntity

  @ManyToOne(type => UserEntity, user => user.chats_as_seller)
  seller: UserEntity

  @OneToMany(type => ChatEntity, chat => chat.room)
  chats?: ChatEntity[]

  @Column({ name: 'latest_chat_at', type: 'bigint', default: 0 })
  latest_chat_at: number
}
