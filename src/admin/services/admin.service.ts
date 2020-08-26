import { Injectable } from "@nestjs/common"

import { UserRepository } from "../../users/repositories/users.repository"
import { SellerAttributeRepository } from "../../users/repositories/seller.repository"
import { ResponseBody, ResponseListWithCountBody } from "../../utils/response"
import { SellerAttribute } from "../../users/entities/seller.entity"
import { ListBuyersQuery, ListSellerQuery } from "../dto/admin.dto"
import { UsersProvider } from "../../users/providers/users.provider"
import { Like } from "typeorm"

@Injectable()
export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository,
    private userProvider: UsersProvider
  ) {}

  async activateSeller(id: string): Promise<ResponseBody<any>> {
    let seller: SellerAttribute = await this.sellerRepo.findOne({
      relations: ['user'],
      where: { id: id }
    })
    seller.is_active = true
    seller.has_paid = true
    seller.updated_at = new Date()
    seller.activation_date = new Date()
    seller.is_blocked = false
    await this.sellerRepo.save(seller)
    let user = seller.user
    user.role = 'seller'
    user.updated_at = new Date()
    await this.userRepo.save(user)
    return new ResponseBody(null, "seller activated")
  }

  async listBuyers(query: ListBuyersQuery) {
    return this.userProvider.listBuyers(query)
  }

  async listSeller(param: ListSellerQuery): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = {}
    if (param.filter == 'blocked') {
      query = { is_blocked: true }
    } else if (param.filter == 'paid') {
      query = { is_active: true, has_paid: true }
    } else if (param.filter == 'not_paid') {
      query = { is_active: true, has_paid: false }
    } else if (param.filter == 'not_verified') {
      query = { is_active: false }
    }
    if (param.name !== undefined && param.name !== '') {
      query = Object.assign({}, query, { shop_name: Like(`%${param.name}%`) })
    }
    let order = {}
    if (param.sort_by == 'created') {
      order = { created_at: param.order.toUpperCase() }
    } else if (param.sort_by == 'name') {
      order = { shop_name: param.order.toUpperCase() }
    }
    const seller = await this.sellerRepo.find({
      where: query,
      skip: skippedItems,
      take: param.limit,
      order: order
    })
    const count = await this.sellerRepo.count({
      where: query,
      order: order
    })
    return new ResponseListWithCountBody(seller, 'ok', param.page, seller.length, count)
  }
}