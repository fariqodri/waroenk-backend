import { Entity, PrimaryColumn, OneToMany, Column } from "typeorm";
import { SellerCategory } from "./seller-category.entity";

@Entity({ name: "categories" })
export class CategoryEntity {

  @PrimaryColumn()
  id: string

  @OneToMany(type => SellerCategory, sellerCategory => sellerCategory.category)
  seller_categories?: SellerCategory[]

  @Column()
  name: string

  @Column()
  image: string
}