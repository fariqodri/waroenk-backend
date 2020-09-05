import { Entity, OneToMany, Column, ManyToOne } from "typeorm";
import { ProductEntity } from './product.entity';
import { CategoryEntity } from "./category.entity";
import { SellerAttribute } from "../../users/entities/seller.entity";

@Entity({ name: "seller_category" })
export class SellerCategory {

  @OneToMany(type => ProductEntity, product => product.category)
  products?: ProductEntity[]

  @ManyToOne(type => CategoryEntity, category => category.seller_categories, { eager: true, primary: true })
  category: CategoryEntity

  @ManyToOne(type => SellerAttribute, seller => seller.categories, { eager: true, primary: true })
  seller: SellerAttribute

  @Column({ nullable: true })
  activation_date: Date

  @Column({ nullable: true })
  expiry_date: Date

  @Column()
  status: 'paid' | 'not_paid' | 'blocked'
}