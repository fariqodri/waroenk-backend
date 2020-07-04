import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from './users.entity';
import { ProductEntity } from "../../products/entities/product.entity";

@Entity({ name: "seller" })
export class SellerAttribute {
  @PrimaryColumn()
  id: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity

  @OneToMany(type => ProductEntity, product => product.seller)
  products?: ProductEntity[]

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

  @Column()
  image: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ default: false })
  is_active: boolean
}