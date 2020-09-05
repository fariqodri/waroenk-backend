import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { UserEntity } from './users.entity';
import { ProductEntity } from "../../products/entities/product.entity";
import { OrderEntity } from "../../order/entities/order.entity";
import { PostEntity } from "../../post/post.entity";
import { SellerBank } from "./seller-bank.entity";
import { SellerCategory } from "src/products/entities/seller-category.entity";

@Entity({ name: "seller" })
export class SellerAttribute {
  @PrimaryColumn()
  id: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity

  @OneToMany(type => SellerCategory, sellerCategory => sellerCategory.seller)
  categories?: SellerCategory[]

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

  @Column({ default: false })
  is_blocked: boolean

  @Column({ default: null, nullable: true })
  activation_date: Date

  @OneToMany(type => PostEntity, post => post.seller)
  posts?: PostEntity[]

  @OneToMany(type => SellerBank, bank => bank.seller, { nullable: true })
  banks?: SellerBank[]
}