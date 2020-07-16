import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery, ProductResponse } from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductRepository) {}

  async findAll(param: ProductQuery): Promise<ResponseBody<ProductResponse[]>> {
    let products: any[];
    const skippedItems = (param.page - 1) * param.limit;
    let queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .andWhere('products.deleted_at IS NULL')
      .andWhere('products.available IS TRUE');
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

  async findOne(productId: string): Promise<ResponseBody<ProductResponse>> {
    try {
      const product = await this.productRepository.findOneOrFail({
        where: { id: productId },
      })
      const response: ProductResponse = {
        id: product.id,
        name: product.name,
        price_per_quantity: product.price_per_quantity,
        seller: {
          id: product.seller.id,
          name: product.seller.shop_name,
          address: product.seller.shop_address,
          image: product.seller.image,
          is_active: product.seller.is_active,
          tier: product.seller.tier
        },
        discount: product.discount,
        description: product.description,
        images: product.images,
        category: {
          id: product.category.id,
          name: product.category.name,
          image: product.category.image
        }
      }
      return new ResponseBody(response)
    } catch(err) {
      throw new NotFoundException(new ResponseBody(null, `product ${productId} not found`))
    }
  }
}
