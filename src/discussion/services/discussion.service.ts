import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { DiscussionPostParam, DiscussionResponse } from '../dto/discussion.dto';
import { DiscussionEntity } from '../entities/discussion.entity';
import { UserRepository } from '../../users/repositories/users.repository';
import { nanoid } from 'nanoid';
import { ProductRepository } from '../../products/repositories/product.repository';

@Injectable()
export class DiscussionService {
  constructor(
    private discussionRepo: DiscussionRepository,
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
  ) {}

  async createDiscussion(userId: string, param: DiscussionPostParam): Promise<ResponseBody<DiscussionResponse>> {
    const user = await this.userRepo
      .createQueryBuilder()
      .where('id = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is inactive so it can't create discussion"))
    }
    const product = await this.productRepo
      .createQueryBuilder()
      .andWhere('id = :id', { id: param.productId })
      .andWhere('deleted_at IS NULL').getOne();
    if (product === undefined) {
      throw new BadRequestException(new ResponseBody(null,
         "product doesn't exist with id [" + param.productId + "]"))
    }
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
      productId: product.id,
      parentId: parentDiscussion? parentDiscussion.id : null,
      description: param.description,
      created_at: newDiscussion.created_at
    }
    return new ResponseBody(response)
  }

  async getDiscussion(productId: string, parentId?: string): Promise<ResponseBody<DiscussionResponse>> {
    let query = this.discussionRepo
      .createQueryBuilder('d')
      .select(`
        d.id AS id,
        d.parentId AS parentId,
        d.productId AS productId,
        d.description AS description,
        d.created_at AS created_at,
        d.updated_at AS updated_at
      `)
      .where('d.productId = :productId', { productId })
    if (parentId && parentId !== "") {
      query = query.andWhere('d.parentId = :parentId', { parentId })
    }
    const discussions = await query.execute()
    return new ResponseBody(discussions)
  }
}