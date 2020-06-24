import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from './users.entity';

@Entity({ name: "seller" })
export class SellerAttribute {

  @PrimaryColumn()
  id: string

  @Column()
  nama_toko: string

  @Column()
  alamat_toko: string

  @Column()
  ttl: string

  @Column()
  kelamin: string

  @Column(type => UserEntity)
  user: UserEntity;
}