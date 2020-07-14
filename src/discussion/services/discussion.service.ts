import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { DiscussionPostParam } from '../dto/discussion.dto';
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

  async createDiscussion(userId: string, param: DiscussionPostParam): Promise<ResponseBody<DiscussionEntity>> {
    const user = await this.userRepo
      .createQueryBuilder()
      .where('id = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is not a seller so it can't create shop"))
    }
    const product = await this.productRepo
      .createQueryBuilder()
      .andWhere('id = :id', { id: param.productId })
      .andWhere('deleted_at IS NULL').getOne();
    if (product === undefined) {
      throw new BadRequestException(new ResponseBody(null,
         "product doesn't exist with id [" + param.productId + "]"))
    }
    let parentDiscussion = null
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
      title: param.title,
      description: param.description,
      images: param.images,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    }
    await this.discussionRepo.insert(newDiscussion)
    return new ResponseBody(newDiscussion)
  }
}