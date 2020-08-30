import { Injectable } from "@nestjs/common"

import { UserRepository } from "../../users/repositories/users.repository"
import { SellerAttributeRepository } from "../../users/repositories/seller.repository"
import { ResponseBody, ResponseListWithCountBody } from "../../utils/response"
import { SellerAttribute } from "../../users/entities/seller.entity"
import { ListBuyersQuery, ListSellerQuery, EditSellerParam, CountOrderParam } from "../dto/admin.dto"
import { UsersProvider } from "../../users/providers/users.provider"
import { Like, Not, Between } from "typeorm"
import { OrderRepository } from "../../order/repositories/order.repository"
import { format } from 'date-fns'

export const BetweenDate = (date1: Date, date2: Date) => 
  Between(format(date1, 'yyyy-MM-dd HH:mm:SS'), format(date2, 'yyyy-MM-dd HH:mm:SS'))

@Injectable()
export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository,
    private userProvider: UsersProvider,
    private orderRepo: OrderRepository
  ) {}

  async countOrder(param: CountOrderParam): Promise<ResponseBody<any>> {
    const dateFrom = new Date(param.yearFrom, param.monthFrom-1, param.dayFrom, 0, 0, 0)
    const dateTo = new Date(param.yearTo, param.monthTo-1, param.dayTo, 23, 59, 59, 999)
    const orderCount = await this.orderRepo.count({
      where: {
        created_at: BetweenDate(dateFrom, dateTo)
      }
    })
    return new ResponseBody({ count: orderCount })
  }

  async countUser(): Promise<ResponseBody<any>> {
    const userCount = await this.userRepo.count({
      where: {
        is_active: true,
        role: Not('admin')
      }
    })
    const sellerCount = await this.sellerRepo.count({ is_active: true, is_blocked: false })
    const newSellerCount = await this.sellerRepo.count({
      is_active: false, has_paid: false, is_blocked: false })
    const response = {
      userCount: userCount,
      sellerCount: sellerCount,
      newSellerCount: newSellerCount
    }
    return new ResponseBody(response)
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
      query = { is_active: true, has_paid: true, is_blocked: false }
    } else if (param.filter == 'not_paid') {
      query = { is_active: true, has_paid: false, is_blocked: false }
    } else if (param.filter == 'not_verified') {
      query = { is_active: false, is_blocked: false }
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
      relations: ['user'],
      where: query,
      skip: skippedItems,
      take: param.limit,
      order: order
    })
    const count = await this.sellerRepo.count({
      where: query
    })
    let response = seller.map(p => ({
      ...p,
      userId: p.user.id
    }))
    response.forEach(function(p) {
      delete p.user
    })
    return new ResponseListWithCountBody(seller, 'ok', param.page, seller.length, count)
  }

  async editSeller(param: EditSellerParam, sellerId: string): Promise<ResponseBody<any>> {
    let seller: SellerAttribute = await this.sellerRepo.findOneOrFail(sellerId, {
      relations: ['user']
    })
    seller.updated_at = new Date()
    if (param.blocked !== undefined) {
      seller.is_blocked = param.blocked
      if (param.blocked) {
        seller.is_active = false
        seller.has_paid = false
      }
      await this.sellerRepo.save(seller)
      return new ResponseBody(null, 'seller has been updated')
    }
    if (param.active !== undefined) {
      seller.is_active = param.active
      if (param.active) {
        seller.activation_date = new Date()
        let user = seller.user
        user.role = 'seller'
        user.updated_at = new Date()
        await this.userRepo.save(user)
      }
    }
    if (param.paid !== undefined) {
      seller.has_paid = param.paid
    }
    if (param.tier !== undefined) {
      seller.tier = param.tier
    }
    await this.sellerRepo.save(seller)
    return new ResponseBody(null, 'seller has been updated')
  }
}