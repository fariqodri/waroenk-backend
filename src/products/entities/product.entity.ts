import { Entity, PrimaryColumn, Column } from "typeorm";
import { CategoryEntity } from './category.entity';
import { UserEntity } from '../../users/entities/users.entity';

@Entity({ name: "product" })
export class ProductEntity {

  @PrimaryColumn()
  id: string

  @Column(type => CategoryEntity)
  category: CategoryEntity

  @Column(type => UserEntity)
  user: UserEntity

  @Column()
  name: string

  @Column()
  price_per_quantity: number

  @Column()
  seller_name: string

  @Column()
  discount: number

  @Column()
  description: string

  @Column()
  images: string[]  
}