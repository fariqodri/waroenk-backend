import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository } from '../products/repositories/product.repository';
import { ShopProductQuery } from './shop.dto';
import { ResponseBody } from '../utils/response';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';

@Injectable()
export class ShopService {
  constructor(
    private productRepo: ProductRepository,
    private sellerRepo: SellerAttributeRepository
  ) {}

  async delete(userId: string, id: string): Promise<ResponseBody<string>> {
    const seller = await this.sellerRepo
        .createQueryBuilder()
        .where('userId = :userId', { userId }).getOne();
    const product = await this.productRepo
        .createQueryBuilder()
        .where('id = :id', { id }).getOne();
    if (seller.user.id != product.seller.user.id) {
      throw new BadRequestException(new ResponseBody(null, "user is not authorized to delete product"))
    }
    product.deleted_at = new Date()
    this.productRepo.save(product)
    return new ResponseBody('ok')
  }

  async getProducts(userId: string, query: ShopProductQuery): Promise<ResponseBody<any[]>> {
    const seller = await this.sellerRepo.createQueryBuilder().where('userId = :userId', { userId }).getOne()
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = this.productRepo
      .createQueryBuilder('products')
      .where('products.sellerId = :sellerId', { sellerId: seller.id });
    if (query.search) {
      queryBuilder = queryBuilder.andWhere('LOWER(products.name) LIKE :name', {
        name: `%${query.search.toLowerCase()}%`,
      });
    }
    queryBuilder = queryBuilder
      .orderBy('products.created_at', 'DESC')
      .addOrderBy('products.name', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .select(
        `products.id AS id,
        products.name AS name,
        products.discount AS discount,
        products.price_per_quantity AS price_per_quantity,
        products.images AS images`,
      );
    let products: any[] = await queryBuilder.execute();
    products = products.map(p => ({
      ...p,
      images: p.images.split(','),
    }));
    return new ResponseBody(products)
  }
}
