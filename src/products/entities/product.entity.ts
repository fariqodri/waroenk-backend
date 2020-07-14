import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CategoryEntity } from './category.entity';
import { SellerAttribute } from "../../users/entities/seller.entity";
import { DiscussionEntity } from "../../discussion/entities/discussion.entity";

@Entity({ name: "product" })
export class ProductEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => CategoryEntity, category => category.products, { eager: true })
  category: CategoryEntity

  @ManyToOne(type => SellerAttribute, seller => seller.products, { eager: true })
  seller: SellerAttribute

  @OneToMany(type => DiscussionEntity, discussion => discussion.product)
  discussions?: DiscussionEntity[]

  @Column()
  name: string

  @Column()
  price_per_quantity: number

  @Column()
  discount: number

  @Column()
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