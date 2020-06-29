import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { UserEntity } from './users.entity';
import { ProductEntity } from "../../products/entities/product.entity";

@Entity({ name: "seller" })
export class SellerAttribute {
  @PrimaryColumn()
  id: string

  @Column()
  shop_name: string

  @Column()
  shop_address: string

  @Column({ type: 'date' })
  birth_date: string

  @Column()
  birth_place: string

  @Column()
  gender: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity

  @OneToMany(type => ProductEntity, product => product.seller)
  products?: ProductEntity[]
}