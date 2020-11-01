import { Entity, Column } from "typeorm";

@Entity({ name: "location" })
export class LocationEntity {

  @Column({ primary: true })
  kode: string

  @Column()
  nama: string
  
}