import { Entity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { CategoryEntity } from './category.entity';
import { SellerAttribute } from "../../users/entities/seller.entity";

@Entity({ name: "product" })
export class ProductEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => CategoryEntity, category => category.products)
  category: CategoryEntity

  @ManyToOne(type => SellerAttribute, seller => seller.products)
  seller: SellerAttribute

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
}