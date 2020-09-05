import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseBody, ResponseListBody } from '../../utils/response';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery, ProductResponse } from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository) {}

  async findAll(param: ProductQuery): Promise<ResponseListBody<ProductResponse[]>> {
    let products: any[];
    const skippedItems = (param.page - 1) * param.limit;
    let queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .andWhere('products.deleted_at IS NULL')
      .andWhere('products.available IS TRUE')
      .andWhere('seller.is_active IS TRUE')
      .andWhere(`seller_category.status IN ('paid', 'not_paid')`);
    if (param.search) {
      queryBuilder = queryBuilder.andWhere('LOWER(products.name) LIKE :name', {
        name: `%${param.search.toLowerCase()}%`,
      });
    }
    if (param.categories) {
      const paramCategories = param.categories.split(',')
      let categoryIds: string[] = []
      for (var index in paramCategories) {
        categoryIds.push("'" + paramCategories[index] + "'")
      }
      let categoryQuery = "(" + categoryIds.join(',') + ")"
      queryBuilder = queryBuilder.andWhere("seller_category.categoryId IN " + categoryQuery);
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
      } else if (param.sort_by === 'newest') {
        queryBuilder = queryBuilder.orderBy(
          'products.created_at', 'DESC',
        );
      }
    }
    if (param.sellerId) {
      queryBuilder = queryBuilder.andWhere(
        'seller.id = :sellerId',
        { sellerId: param.sellerId },
      );
    }
    queryBuilder = queryBuilder
      .offset(skippedItems)
      .limit(param.limit)
      .innerJoin('products.category', 'seller_category')
      .innerJoin('seller_category.category', 'category')
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
        'category.name AS category_name',
        'category.id AS category_id',
        'seller.shop_name AS shop_name',
        'seller.shop_address AS shop_address',
        'seller.description AS shop_description',
        'seller.id AS seller_id'
      ]);
    products = await queryBuilder.execute();
    products = products.map(p => ({
      ...p,
      discount: Number(p.discount) == 0? 0.00: Number(p.discount),
      images: p.images.split(','),
    }));
    products.forEach(function(p) {
      delete p.userId
    });
    return new ResponseListBody(products, "ok", Number(param.page), products.length);
  }

  async findOne(productId: string, userId: string, role: string): Promise<ResponseBody<ProductResponse>> {
    try {
      const product = await this.productRepository.findOneOrFail({
        where: { id: productId },
        join: {
          alias: 'product',
          innerJoinAndSelect: {
            seller: 'product.seller',
            user: 'seller.user',
            seller_category: 'product.category',
            category: 'seller_category.category'
          }
        }
      })
      let isMyProduct: boolean
      if (userId != '' && role === 'seller') {
        isMyProduct = product.seller.user.id == userId
      }
      const response: ProductResponse = {
        id: product.id,
        product_seller_user_id: product.seller.user.id,
        name: product.name,
        price_per_quantity: product.price_per_quantity,
        seller: {
          id: product.seller.id,
          shop_name: product.seller.shop_name,
          shop_address: product.seller.shop_address,
          description: product.seller.description,
          image: product.seller.image,
          is_active: product.seller.is_active,
          tier: product.seller.tier
        },
        discount: Number(product.discount) == 0? 0.00: Number(product.discount),
        description: product.description,
        images: product.images,
        category: {
          id: product.category.category.id,
          name: product.category.category.name,
          image: product.category.category.image
        },
        is_my_product: isMyProduct
      }
      return new ResponseBody(response)
    } catch(err) {
      throw new NotFoundException(new ResponseBody(null, `product ${productId} not found`))
    }
  }
}
