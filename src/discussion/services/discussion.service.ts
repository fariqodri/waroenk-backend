import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { DiscussionPostParam, DiscussionResponse } from '../dto/discussion.dto';
import { DiscussionEntity } from '../entities/discussion.entity';
import { UserRepository } from '../../users/repositories/users.repository';
import { nanoid } from 'nanoid';
import { ProductRepository } from '../../products/repositories/product.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

@Injectable()
export class DiscussionService {
  constructor(
    private discussionRepo: DiscussionRepository,
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
    private sellerRepo: SellerAttributeRepository
  ) {}

  async createDiscussion(userId: string, param: DiscussionPostParam): Promise<ResponseBody<DiscussionResponse>> {
    const user = await this.userRepo
      .createQueryBuilder()
      .where('id = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `user with userId: [${userId}] is inactive so it can't create discussion`))
    }
    const product = await this.productRepo.findOne({
      relations: ['seller'],
      where: { id: param.productId, deleted_at: null }
    })
    if (product === undefined) {
      throw new BadRequestException(new ResponseBody(null,
         `product doesn't exist with id [${param.productId}]`))
    }
    const seller = await this.sellerRepo.findOne({
      relations: ['user'],
      where: { id: product.seller.id }})
    let parentDiscussion: DiscussionEntity = null
    if (param.parentId) {
      parentDiscussion = await this.discussionRepo
      .createQueryBuilder()
      .where('id = :id', { id: param.parentId })
      .andWhere('deleted_at IS NULL').getOne();
    }
    const newDiscussion: DiscussionEntity = {
      id: nanoid(11),
      user: user,
      product: product,
      parent: parentDiscussion,
      description: param.description,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    }
    await this.discussionRepo.insert(newDiscussion)
    const response: DiscussionResponse = {
      id: newDiscussion.id,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      productId: product.id,
      parentId: parentDiscussion? parentDiscussion.id : null,
      parentUserName: parentDiscussion? parentDiscussion.user.full_name: null,
      parentUserRole: parentDiscussion? parentDiscussion.user.role: null,
      description: param.description,
      created_at: newDiscussion.created_at,
      isSellerProduct: user.id == seller.user.id
    }
    return new ResponseBody(response)
  }

  async getDiscussion(productId: string, parentId?: string): Promise<ResponseBody<any>> {
    let query = this.discussionRepo
      .createQueryBuilder('d')
      .innerJoin('d.user', 'user')
      .innerJoin('d.product', 'product')
      .select(`
        d.id AS id,
        d.parentId AS parentId,
        d.productId AS productId,
        d.description AS description,
        d.created_at AS created_at,
        d.updated_at AS updated_at
      `)
      .addSelect([
        'user.id AS userId',
        'user.full_name AS userName',
        'user.role AS userRole'
      ])
      .where('d.productId = :productId', { productId })
      .andWhere('d.deleted_at IS NULL')
    if (parentId && parentId !== "") {
      query = query.andWhere('d.parentId = :parentId', { parentId })
    }
    let discussions = await query.execute()

    discussions = discussions.map(p => ({
      ...p,
      isSellerProduct: false
    }));

    for (let discussion of discussions) {
      const product = await this.productRepo.findOne({
        relations: ['seller'],
        where: { id: discussion.productId, deleted_at: null }
      })
      const seller = await this.sellerRepo.findOne({
        relations: ['user'],
        where: { id: product.seller.id }})
      discussion.isSellerProduct = discussion.userId == seller.user.id
    };
    
    return new ResponseBody(discussions)
  }
}