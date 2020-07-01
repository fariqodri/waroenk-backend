import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { ShopProductQuery, ProductPostParam } from './shop.dto';
import { ResponseBody } from '../utils/response';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { ProductEntity } from '../products/entities/product.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class ShopService {
  constructor(
    private productRepo: ProductRepository,
    private sellerRepo: SellerAttributeRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async create(userId: string, param: ProductPostParam): Promise<ResponseBody<ProductEntity>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId }).getOne();
    const category = await this.categoryRepo.findOne(param.categoryId);
    const product: ProductEntity = {
      id: nanoid(11),
      seller: seller,
      category: category,
      name: param.name,
      price_per_quantity: param.price_per_quantiy,
      discount: param.discount,
      description: param.description,
      images: param.images.split(","),
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    }
    await this.productRepo.insert(product)
    return new ResponseBody(product);
  }

  async delete(userId: string, id: string): Promise<ResponseBody<string>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId }).getOne()
    const product = await this.productRepo
      .createQueryBuilder()
      .where('sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('id = :id', { id: id }).getOne();
    if (product === undefined) {
      throw new BadRequestException(new ResponseBody(null,
         "user is not authorized to delete product or product doesn't exist with id [" + id + "]"))
    }
    product.deleted_at = new Date()
    await this.productRepo.save(product)
    return new ResponseBody("product with id [" + id + "] deleted");
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
