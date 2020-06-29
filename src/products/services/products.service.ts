import { Injectable } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { ProductEntity } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery, ProductResponse } from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductRepository) {}

  async findAll(param: ProductQuery): Promise<ResponseBody<ProductResponse[]>> {
    let products: any[];
    const skippedItems = (param.page - 1) * param.limit;
    let queryBuilder = this.productRepository.createQueryBuilder('products');
    if (param.search) {
      queryBuilder = queryBuilder.where('LOWER(products.name) LIKE :name', {
        name: `%${param.search.toLowerCase()}%`,
      });
    }
    if (param.category) {
      queryBuilder = queryBuilder.where('products.categoryId = :categoryId', {
        categoryId: param.category,
      });
    }
    if (param.price_from) {
      queryBuilder = queryBuilder.where(
        'products.price_per_quantity >= :price',
        { price: param.price_from },
      );
    }
    if (param.price_to) {
      queryBuilder = queryBuilder.where(
        'products.price_per_quantity <= :price',
        { price: param.price_to },
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
    queryBuilder = queryBuilder
      .offset(skippedItems)
      .limit(param.limit)
      .innerJoin('products.category', 'categories')
      .innerJoin('products.seller', 'seller')
      .select(
        'products.id AS id, products.name AS name, products.price_per_quantity AS price_per_quantity, products.discount AS discount, products.description AS description, products.images AS images',
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
