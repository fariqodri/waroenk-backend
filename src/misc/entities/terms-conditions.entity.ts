import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'seller_terms_conditions' })
export class SellerTermsConditionsEntity {
  @PrimaryGeneratedColumn('increment')
  version: number

  @Column()
  file: string

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date
}
