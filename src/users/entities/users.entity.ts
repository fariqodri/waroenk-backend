import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Exclude } from 'class-transformer';
import { SellerAttribute } from './seller.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryColumn()
  id: string

  @OneToMany(type => SellerAttribute, seller => seller.user)
  seller_attributes: SellerAttribute[]

  @OneToMany(type => ProductEntity, product => product.category)
  products: ProductEntity[]

  @Column()
  full_name: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column()
  role: string

  @Exclude()
  password: string

}