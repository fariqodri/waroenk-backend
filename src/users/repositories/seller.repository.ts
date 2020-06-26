import { Repository, EntityRepository } from "typeorm";
import { SellerAttribute } from "../entities/seller.entity";

@EntityRepository(SellerAttribute)
export class SellerAttributeRepository extends Repository<SellerAttribute> {}