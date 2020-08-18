import { Injectable, NotAcceptableException } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { ShopService } from "../shop/shop.service";
import { nanoid } from "nanoid";
import { MINIMUM_SELLER_TIER_FOR_POSTING } from "../constants";
import { ResponseBody } from "../utils/response";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly shopService: ShopService
  ) {}

  async createPost(userId: string, title: string, content: string) {
    const seller = await this.shopService.getShopByUserId(userId)
    if (seller.tier < MINIMUM_SELLER_TIER_FOR_POSTING) {
      throw new NotAcceptableException(new ResponseBody(null, "your tier is below the required tier for creating posts"))
    }
    const id = nanoid(11)
    await this.postRepo.insert({
      id,
      title,
      content,
      seller
    })
    return {
      id,
      title,
      content,
    }
  }
}
