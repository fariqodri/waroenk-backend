import { Entity, PrimaryColumn, OneToMany, Column } from "typeorm";
import { ProductEntity } from './product.entity';

@Entity({ name: "categories" })
export class CategoryEntity {

  @PrimaryColumn()
  id: string

  @OneToMany(type => ProductEntity, product => product.category)
  products?: ProductEntity[]

  @Column()
  name: string

  @Column()
  image: string
}