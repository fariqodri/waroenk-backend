import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { SellerAttribute } from "../../users/entities/seller.entity";
import { DiscussionEntity } from "../../discussion/entities/discussion.entity";
import { CartEntity } from "../../order/entities/cart.entity";
import { SellerCategory } from "./seller-category.entity";

@Entity({ name: "product" })
export class ProductEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => SellerAttribute, seller => seller.products, { eager: true })
  seller: SellerAttribute

  @ManyToOne(type => SellerCategory, category => category.products, { eager: true })
  category: SellerCategory

  @OneToMany(type => DiscussionEntity, discussion => discussion.product)
  discussions?: DiscussionEntity[]

  @OneToMany(type => CartEntity, cart => cart.user)
  carts?: CartEntity[]

  @Column()
  name: string

  @Column()
  price_per_quantity: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  discount: number

  @Column({ length: 800 })
  description: string

  @Column('simple-array')
  images: string[]

  @Column({ default: true })
  available: boolean

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ nullable: true })
  deleted_at: Date
}