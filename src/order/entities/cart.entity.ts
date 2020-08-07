import { Entity, Column, ManyToOne } from "typeorm";
import { UserEntity } from "../../users/entities/users.entity";
import { ProductEntity } from "../../products/entities/product.entity";

@Entity({ name: "cart" })
export class CartEntity {

  @ManyToOne(type => ProductEntity, product => product.carts, { eager: true, primary: true })
  product: ProductEntity

  @ManyToOne(type => UserEntity, user => user.carts, { eager: true, primary: true })
  user: UserEntity

  @Column({ default: 0 })
  quantity: number

  @Column()
  is_active: boolean
}