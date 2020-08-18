import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { UserEntity } from './users.entity';
import { ProductEntity } from "../../products/entities/product.entity";
import { OrderEntity } from "../../order/entities/order.entity";
import { PostEntity } from "../../post/post.entity";

@Entity({ name: "seller" })
export class SellerAttribute {
  @PrimaryColumn()
  id: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity

  @OneToMany(type => ProductEntity, product => product.seller)
  products?: ProductEntity[]

  @OneToMany(type => OrderEntity, order => order.seller)
  orders?: OrderEntity[]

  @Column({ default: 1 })
  tier: number

  @Column({ nullable: true })
  description: string

  @Column()
  shop_name: string

  @Column()
  shop_address: string

  @Column({ type: 'date' })
  birth_date: string

  @Column()
  birth_place: string

  @Column()
  gender: string

  @Column()
  image: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: false })
  is_active: boolean

  @Column({ default: false })
  has_paid: boolean

  @OneToMany(type => PostEntity, post => post.seller)
  posts?: PostEntity[]
}