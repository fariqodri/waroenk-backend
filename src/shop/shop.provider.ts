import { Injectable } from "@nestjs/common";
import { SellerAttribute } from "../users/entities/seller.entity";
import { SellerAttributeRepository } from "../users/repositories/seller.repository";

@Injectable()
export class ShopProvider {
  constructor(
    private readonly sellerRepo: SellerAttributeRepository
  ) {}
  getShopById(id: string): Promise<SellerAttribute> {
    return this.sellerRepo.findOneOrFail({
      where: { id },
      relations: ['user']
    })
  }

  getShopByUserId(userId: string): Promise<SellerAttribute> {
    return this.sellerRepo.findOneOrFail({ 
      where: { user: { id: userId } },
      relations: ['user']
    })
  }
}