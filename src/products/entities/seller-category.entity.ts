import { Entity, OneToMany, Column, ManyToOne, PrimaryColumn } from "typeorm";
import { ProductEntity } from './product.entity';
import { CategoryEntity } from "./category.entity";
import { SellerAttribute } from "../../users/entities/seller.entity";

@Entity({ name: "seller_category" })
export class SellerCategory {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => CategoryEntity, category => category.seller_categories, { eager: true })
  category: CategoryEntity

  @ManyToOne(type => SellerAttribute, seller => seller.categories, { eager: true })
  seller: SellerAttribute

  @Column({ nullable: true })
  activation_date: Date

  @Column({ nullable: true })
  expiry_date: Date

  @Column({ default: 'blocked' })
  status: 'paid' | 'not_paid' | 'blocked' | 'proposed'

  @OneToMany(type => ProductEntity, product => product.category)
  products?: ProductEntity[]
}