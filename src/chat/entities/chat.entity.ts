import { Entity, Column, Index, PrimaryColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { ChatRoomEntity } from "./chat-room.entity";
import { UserEntity } from "../../users/entities/users.entity";
import { OrderEntity } from "../../order/entities/order.entity";

@Entity({ name: 'chats' })
@Index(["date", "time"])
export class ChatEntity {
  @PrimaryColumn()
  id: string

  /**
   * YYYY-MM-DD
   */
  @Column({ type: 'date' })
  date: string

  /**
   * hh:mm:ss
   */
  @Column({ type: 'time' })
  time: string

  @Column({ nullable: true, type: 'text', default: null })
  text?: string

  @ManyToOne(type => OrderEntity, { nullable: true, eager: true, onDelete: 'SET NULL' })
  order?: OrderEntity

  @ManyToOne(type => ChatRoomEntity, room => room.chats, { onDelete: 'CASCADE' })
  room: ChatRoomEntity

  @ManyToOne(type => UserEntity)
  sender: UserEntity

  @ManyToOne(type => UserEntity)
  receiver: UserEntity

  @Column({ type: 'boolean', default: false })
  read_by_receiver?: boolean

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date
}
