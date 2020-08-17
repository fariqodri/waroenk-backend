import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { LocationEntity } from "../../misc/entities/location.entity";
import { UserEntity } from "./users.entity";

@Entity({ name: 'shipping_address' })
export class ShippingAddressEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'receiver_name' })
  receiver_name: string;

  @Column({ name: 'receiver_phone' })
  receiver_phone: string;

  @Column({ name: 'street' })
  street: string;

  @ManyToOne(type => LocationEntity)
  city: LocationEntity
  
  @ManyToOne(type => LocationEntity)
  kecamatan: LocationEntity

  @ManyToOne(type => LocationEntity)
  kelurahan: LocationEntity

  @Column({ name: 'post_code' })
  post_code: string

  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity
}
