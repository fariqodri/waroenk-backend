import { Injectable } from "@nestjs/common"

import { UserRepository } from "../../users/repositories/users.repository"
import { SellerAttributeRepository } from "../../users/repositories/seller.repository"
import { ResponseBody } from "../../utils/response"
import { SellerAttribute } from "../../users/entities/seller.entity"

@Injectable()
export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository
  ) {}

  async activateSeller(id: string): Promise<ResponseBody<any>> {
    let seller: SellerAttribute = await this.sellerRepo.findOne({
      relations: ['user'],
      where: { id: id }
    })
    seller.is_active = true
    seller.has_paid = true
    seller.updated_at = new Date()
    await this.sellerRepo.save(seller)
    let user = seller.user
    user.role = 'seller'
    user.updated_at = new Date()
    await this.userRepo.save(user)
    return new ResponseBody(null, "seller activated")
  }
}