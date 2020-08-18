import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { SellerAttribute } from "../users/entities/seller.entity";

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'title' })
  title: string

  @Column({ name: 'content', type: 'text' })
  content: string

  @ManyToOne(type => SellerAttribute, seller => seller.posts)
  seller: SellerAttribute
}
