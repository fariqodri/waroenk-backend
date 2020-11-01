import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "slider" })
export class SliderEntity {

  @PrimaryColumn()
  id: string

  @Column()
  image: string

  @Column()
  deleted_at: Date

}