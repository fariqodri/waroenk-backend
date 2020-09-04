import { Injectable, NotAcceptableException } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { nanoid } from "nanoid";
import { MINIMUM_SELLER_TIER_FOR_POSTING } from "../constants";
import { ResponseBody } from "../utils/response";
import { ShopProvider } from "../shop/shop.provider";
import { GetPostQuery } from "./post.dto";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly shopProvider: ShopProvider
  ) {}

  async createPost(userId: string, title: string, content: string, image: string) {
    const seller = await this.shopProvider.getShopByUserId(userId)
    if (seller.tier < MINIMUM_SELLER_TIER_FOR_POSTING) {
      throw new NotAcceptableException(new ResponseBody(null, "your tier is below the required tier for creating posts"))
    }
    const id = nanoid(11)
    await this.postRepo.insert({
      id,
      title,
      content,
      seller,
      image
    })
    return {
      id,
      title,
      content,
      image
    }
  }

  async getPosts({ page, limit, sort }: GetPostQuery, userId: string) {
    const seller = await this.shopProvider.getShopByUserId(userId)
    const skippedItems = (page - 1) * limit;
    const query = this.postRepo.createQueryBuilder('post')
      .where('post.sellerId = :sellerId', { sellerId: seller.id })
      .offset(skippedItems)
      .limit(limit)
      .orderBy('created_at', sort === 'latest' ? 'DESC' : 'ASC')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.image'
      ])
    const [result, total] = await query.getManyAndCount()
    
    return { result, total }
  }
}
