import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "sponsor" })
export class SponsorEntity {

  @PrimaryColumn()
  id: string

  @Column()
  image: string

  @Column()
  type: "slider" | "sponsor"

  @Column()
  deleted_at: Date

}