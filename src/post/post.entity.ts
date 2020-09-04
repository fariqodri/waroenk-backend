import { Entity, PrimaryColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { SellerAttribute } from "../users/entities/seller.entity";

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'title' })
  title: string

  @Column({ name: 'content', type: 'text' })
  content: string

  @Column({ name: 'image', nullable: true, default: null })
  image?: string

  @ManyToOne(type => SellerAttribute, seller => seller.posts)
  seller: SellerAttribute

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date
}
