import { Injectable } from "@nestjs/common"
import { format } from 'date-fns'

import { UserRepository } from "../../users/repositories/users.repository"
import { SellerAttributeRepository } from "../../users/repositories/seller.repository"
import { ResponseBody, ResponseListWithCountBody } from "../../utils/response"
import { SellerAttribute } from "../../users/entities/seller.entity"
import { ListBuyersQuery, ListSellerQuery, EditSellerParam, CountOrderParam, ListProposalParam, ListDiscussionParam } from "../dto/admin.dto"
import { UsersProvider } from "../../users/providers/users.provider"
import { Like, Not, Between } from "typeorm"
import { OrderRepository } from "../../order/repositories/order.repository"
import { ProposalRepository } from "../../proposal/repositories/proposal.repository"
import { DiscussionRepository } from "../../discussion/repositories/discussion.repository"
import { DiscussionEntity } from "../../discussion/entities/discussion.entity"

export const BetweenDate = (date1: Date, date2: Date) => 
  Between(format(date1, 'yyyy-MM-dd HH:mm:SS'), format(date2, 'yyyy-MM-dd HH:mm:SS'))

@Injectable()
export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository,
    private userProvider: UsersProvider,
    private orderRepo: OrderRepository,
    private proposalRepo: ProposalRepository,
    private discussionRepo: DiscussionRepository,
  ) {}

  async listDiscussion(param: ListDiscussionParam): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = this.discussionRepo
      .createQueryBuilder('d')
      .orderBy('d.created_at', 'DESC')
      .innerJoin('d.user', 'user')
      .innerJoin('d.product', 'product')
      .select(`
        d.id AS id,
        d.parentId AS parentId,
        d.productId AS productId,
        d.description AS description,
        d.created_at AS created_at
      `)
      .addSelect([
        'user.id AS userId',
        'user.full_name AS userName',
        'product.name AS productName'
      ])
      .andWhere('d.deleted_at IS NULL')
    if (param.search !== undefined && param.search !== '') {
      query = query.andWhere('d.description LIKE :searchDescription AND d.deleted_at IS NULL', 
        { searchDescription: `%${param.search}%` })
      query = query.orWhere('user.full_name LIKE :searchUser AND d.deleted_at IS NULL', 
        { searchUser: `%${param.search}%` })
      query = query.orWhere('product.name LIKE :searchName AND d.deleted_at IS NULL', 
        { searchName: `%${param.search}%` })
    }
    let count = await query.getCount()
    query = query.offset(skippedItems).limit(param.limit)
    let discussions = await query.execute()
    return new ResponseListWithCountBody(discussions, 'ok', param.page, discussions.length, count)
  }

  async deleteDiscussion(id: string): Promise<ResponseBody<any>> {
    let discussions: DiscussionEntity[] = await this.discussionRepo.createQueryBuilder('d')
      .where('d.id = :id', { id: id })
      .orWhere('d.parentId = :parentId', { parentId: id }).getMany();
    for(let discussion of discussions) {
      discussion.deleted_at = new Date()
      discussion.updated_at = new Date()
    }
    await this.discussionRepo.save(discussions)
    return new ResponseBody(null, 'discussion deleted')
  } 

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

  async listProposal(param: ListProposalParam): Promise<ResponseBody<any>> {
    const skippedItems = (param.page - 1) * param.limit;
    let query = { is_active: true }
    if (param.type !== undefined && param.type !== '') {
      query = Object.assign({}, query, { type: param.type })
    }
    const proposals = await this.proposalRepo.find({
      relations: ['data', 'user'],
      where: query,
      skip: skippedItems,
      take: param.limit,
      order: { created_at: 'DESC' }
    })
    const proposalCount = await this.proposalRepo.count({ where: query })
    let response = []
    for (let proposal of proposals) {
      response.push({
        id: proposal.id,
        data: proposal.data,
        type: proposal.type,
        userId: proposal.user.id,
        userName: proposal.user.full_name
      })
    }
    return new ResponseListWithCountBody(response, 'ok', param.page, proposals.length, proposalCount)
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