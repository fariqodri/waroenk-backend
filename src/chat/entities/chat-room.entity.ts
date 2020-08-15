import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { SellerAttribute } from "../../users/entities/seller.entity";
import { ChatEntity } from "./chat.entity";

@Entity({ name: 'chat_rooms' })
export class ChatRoomEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(type => UserEntity, user => user.chats_as_buyer)
  buyer: UserEntity

  @ManyToOne(type => UserEntity, user => user.chats_as_seller)
  seller: UserEntity

  @OneToMany(type => ChatEntity, chat => chat.room)
  chats?: ChatEntity[]
}
