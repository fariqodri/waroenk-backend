import { Entity, Column, ManyToOne, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { OrderItem } from "./order-item.entity";

@Entity({ name: "order" })
export class OrderEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => UserEntity, user => user.orders, { eager: true })
  user: UserEntity

  @OneToMany(type => OrderItem, item => item.order)
  items: OrderItem[]

  @Column()
  status: string

  @Column()
  address: string

  @Column({ default: 0 })
  fare: number

  @Column({ nullable: true })
  courier: string

  @Column({ nullable: true })
  notes: string

  @Column({ nullable: true })
  payment_bank: string

  @Column({ nullable: true })
  account_owner: string

  @Column({ nullable: true })
  account_number: string

  @Column({ nullable: true })
  payment_proof: string

  @Column({ nullable: true })
  receipt_number: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column()
  is_active: boolean
}