import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "categories" })
export class CategoryEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  image: string
}