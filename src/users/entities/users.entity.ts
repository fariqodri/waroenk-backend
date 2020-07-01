import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Exclude } from 'class-transformer';
import { SellerAttribute } from './seller.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryColumn()
  id: string

  @Column()
  full_name: string

  @Column({ unique: true })
  email: string

  @Column()
  phone: string

  @Column()
  role: 'buyer' | 'seller'

  @Exclude()
  @Column()
  password: string

}