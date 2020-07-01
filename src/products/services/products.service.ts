import { Injectable, BadRequestException } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery, ProductResponse } from '../dto/product.dto';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private sellerRepository: SellerAttributeRepository) {}

  async delete(userId: string, id: string): Promise<ResponseBody<string>> {
    const seller = await this.sellerRepository
        .createQueryBuilder()
        .where('userId = :userId', { userId }).getOne();
    const product = await this.productRepository
        .createQueryBuilder()
        .where('id = :id', { id }).getOne();
    if (seller.user.id != product.seller.user.id) {
      throw new BadRequestException(new ResponseBody(null, "user is not authorized to delete product"))
    }
    product.deleted_at = new Date()
    this.productRepository.save(product)
    return new ResponseBody('ok')
  }

  async findAll(param: ProductQuery): Promise<ResponseBody<ProductResponse[]>> {
    let products: any[];
    const skippedItems = (param.page - 1) * param.limit;
    let queryBuilder = this.productRepository.createQueryBuilder('products');
    if (param.search) {
      queryBuilder = queryBuilder.andWhere('LOWER(products.name) LIKE :name', {
        name: `%${param.search.toLowerCase()}%`,
      });
    }
    if (param.category) {
      queryBuilder = queryBuilder.andWhere('products.categoryId = :categoryId', {
        categoryId: param.category,
      });
    }
    if (param.price_from) {
      queryBuilder = queryBuilder.andWhere(
        'products.price_per_quantity >= :priceFrom',
        { priceFrom: param.price_from },
      );
    }
    if (param.price_to) {
      queryBuilder = queryBuilder.andWhere(
        'products.price_per_quantity <= :priceTo',
        { priceTo: param.price_to },
      );
    }
    if (param.sort_by) {
      if (param.sort_by === 'price') {
        queryBuilder = queryBuilder.orderBy(
          'products.price_per_quantity',
          param.sort_type === 'desc' ? 'DESC' : 'ASC',
        );
      }
    }
    queryBuilder = queryBuilder.andWhere('products.deleted_at IS NOT NULL');
    queryBuilder = queryBuilder
      .offset(skippedItems)
      .limit(param.limit)
      .innerJoin('products.category', 'categories')
      .innerJoin('products.seller', 'seller')
      .select(
        `products.id AS id,
        products.name AS name,
        products.price_per_quantity AS price_per_quantity,
        products.discount AS discount,
        products.description AS description,
        products.images AS images`,
      )
      .addSelect([
        'categories.name AS category',
        'seller.shop_name AS seller_name',
      ]);
    products = await queryBuilder.execute();
    products = products.map(p => ({
      ...p,
      images: p.images.split(','),
    }));
    return new ResponseBody(products);
  }
}
