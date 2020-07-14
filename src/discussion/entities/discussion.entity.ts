import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ProductEntity } from "../../products/entities/product.entity";
import { UserEntity } from "../../users/entities/users.entity";

@Entity({ name: "discussions" })
export class DiscussionEntity {

  @PrimaryColumn()
  id: string

  @ManyToOne(type => UserEntity, user => user.discussions, { eager: true })
  user: UserEntity

  @ManyToOne(type => ProductEntity, product => product.discussions, { eager: true })
  product: ProductEntity

  @ManyToOne(type => DiscussionEntity, discussion => discussion.replies, { eager: true})
  parent?: DiscussionEntity

  @OneToMany(type => DiscussionEntity, discussion => discussion.parent)
  replies?: DiscussionEntity[]

  @Column()
  title: string

  @Column()
  description: string

  @Column('simple-array')
  images: string[]

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date

  @Column({ nullable: true })
  deleted_at: Date
}