import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, CreateDateColumn, Unique } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { ChatEntity } from "./chat.entity";

@Entity({ name: 'chat_rooms' })
@Unique(['participant_one', 'participant_two'])
export class ChatRoomEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(type => UserEntity)
  participant_one: UserEntity

  @ManyToOne(type => UserEntity)
  participant_two: UserEntity

  @OneToMany(type => ChatEntity, chat => chat.room)
  chats?: ChatEntity[]

  @Column({ name: 'latest_chat_at', type: 'bigint', default: 0 })
  latest_chat_at: number
}
