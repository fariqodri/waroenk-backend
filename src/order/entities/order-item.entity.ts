import { Entity, Column, ManyToOne } from "typeorm";
import { ProductEntity } from "../../products/entities/product.entity";
import { OrderEntity } from "./order.entity";

@Entity({ name: "orderItem" })
export class OrderItem {

  @ManyToOne(type => ProductEntity, product => product.carts, { eager: true, primary: true })
  product: ProductEntity

  @ManyToOne(type => OrderEntity, order => order.items, { eager: true, primary: true })
  order: OrderEntity

  @Column({ default: 0 })
  quantity: number
}