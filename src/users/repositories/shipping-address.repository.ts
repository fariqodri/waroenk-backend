import { Repository, EntityRepository } from "typeorm";
import { ShippingAddressEntity } from "../entities/shipping-address.entity";

@EntityRepository(ShippingAddressEntity)
export class ShippingAddressRepository extends Repository<ShippingAddressEntity> {}
