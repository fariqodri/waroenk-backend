import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { SellerAttribute } from "./seller.entity";

@Entity({ name: "seller_bank" })
export class SellerBank {
  @PrimaryColumn()
  id: string

  @ManyToOne(type => SellerAttribute, seller => seller.banks, { eager: true })
  seller: SellerAttribute

  @Column()
  bank: string

  @Column()
  number: string

  @Column()
  owner: string

  @Column({ default: true })
  is_active: boolean

  @Column()
  created_at: Date

  @Column({ nullable: true })
  updated_at: Date
}