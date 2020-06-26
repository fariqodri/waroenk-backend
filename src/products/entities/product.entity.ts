import { Entity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { CategoryEntity } from './category.entity';
import { UserEntity } from '../../users/entities/users.entity';

@Entity({ name: "product" })
export class ProductEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => CategoryEntity, category => category.products)
  category: CategoryEntity

  @ManyToOne(type => UserEntity, user => user.products)
  user: UserEntity

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