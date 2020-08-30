import { Repository, EntityRepository } from "typeorm";
import { SellerBank } from "../entities/seller-bank.entity";

@EntityRepository(SellerBank)
export class SellerBankRepository extends Repository<SellerBank> {}