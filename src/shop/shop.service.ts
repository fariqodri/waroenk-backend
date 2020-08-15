import { Injectable, BadRequestException, Param } from '@nestjs/common';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { ShopProductQuery, ProductCreateParam, ProductEditParam, ShopPostParam } from './shop.dto';
import { ResponseBody, ResponseListBody } from '../utils/response';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { ProductEntity } from '../products/entities/product.entity';
import { SellerAttribute } from '../users/entities/seller.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class ShopService {
  constructor(
    private productRepo: ProductRepository,
    private sellerRepo: SellerAttributeRepository,
    private categoryRepo: CategoryRepository,
    private userRepo: UserRepository
  ) {}

  async getShop(id: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail(id);
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "there is no shop with id: [" + id + "]"))
    }
    const response = {
      id: id,
      description: seller.description,
      shop_name: seller.shop_name,
      shop_address: seller.shop_address,
      birth_date: seller.birth_date,
      birth_place: seller.birth_place,
      gender: seller.gender,
      image: seller.image,
      tier: seller.tier
    }
    return new ResponseBody(response);
  }

  async createShop(userId: string, param: ShopPostParam): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId }).getOne();
    if (seller != undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "there is existing shop with userId: [" + userId + "]"))
    }
    const user = await this.userRepo
      .createQueryBuilder()
      .where('id = :userId', { userId: userId })
      .andWhere('is_active IS TRUE')
      .andWhere("role = 'buyer'").getOne();
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "user with userId: [" + userId + "] is not a buyer or not active so it can't create shop"))
    }
    const newSeller: SellerAttribute = {
      id: nanoid(11),
      user: user,
      description: param.description,
      shop_name: param.shop_name,
      shop_address: param.shop_address,
      birth_date: param.birth_date,
      birth_place: param.birth_place,
      gender: param.gender,
      image: param.image,
      tier: 1,
      created_at: new Date(),
      updated_at: null,
      is_active: false
    }
    await this.sellerRepo.insert(newSeller)
    const response = {
      id: newSeller.id,
      userId: user.id,
      description: param.description,
      shop_name: param.shop_name,
      shop_address: param.shop_address,
      birth_date: param.birth_date,
      birth_place: param.birth_place,
      gender: param.gender,
      image: param.image,
      tier: 1,
      created_at: newSeller.created_at,
      is_active: false
    }
    return new ResponseBody(response);
  }

  async editShop(userId: string, param: ShopPostParam): Promise<ResponseBody<SellerAttribute>> {
    let seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId }).getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "there is no shop with userId: [" + userId + "]"))
    }
    if (param.description) {
      seller.description = param.description
    }
    if (param.shop_name) {
      seller.shop_name = param.shop_name
    }
    if (param.shop_address) {
      seller.shop_address = param.shop_address
    }
    if (param.birth_date) {
      seller.birth_date = param.birth_date
    }
    if (param.birth_place) {
      seller.birth_place = param.birth_place
    }
    if (param.gender) {
      seller.gender = param.gender
    }
    if (param.image) {
      seller.image = param.image
    }
    seller.updated_at = new Date()
    await this.sellerRepo.save(seller)
    return new ResponseBody(seller);
  }

  async createProduct(userId: string, param: ProductCreateParam): Promise<ResponseBody<ProductEntity>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "seller with userId: [" + userId + "] is inactive so it can't create product"))
    }
    const category = await this.categoryRepo.findOne(param.categoryId);
    let discount = 0
    if (param.discount) {
      discount = param.discount
    }
    const product: ProductEntity = {
      id: nanoid(11),
      seller: seller,
      category: category,
      name: param.name,
      price_per_quantity: param.price_per_quantity,
      discount: discount,
      description: param.description,
      images: param.images,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
      available: param.available
    }
    await this.productRepo.insert(product)
    return new ResponseBody(product);
  }

  async editProduct(id: string, userId: string, param: ProductEditParam): Promise<ResponseBody<ProductEntity>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        "seller with userId: [" + userId + "] is inactive so it can't edit product"))
    }
    let product = await this.productRepo
      .createQueryBuilder()
      .where('sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('id = :id', { id: id }).getOne();
    if (param.categoryId) {
      const category = await this.categoryRepo.findOne(param.categoryId);
      product.category = category
    }
    if (param.discount) {
      product.discount = param.discount
    }
    if (param.name) {
      product.name = param.name
    }
    if (param.price_per_quantity) {
      product.price_per_quantity = param.price_per_quantity
    }
    if (param.description) {
      product.description = param.description
    }
    if (param.images) {
      product.images = param.images
    }
    if (param.available) {
      product.available = param.available
    }
    product.updated_at = new Date()
    await this.productRepo.save(product)
    return new ResponseBody(product);
  }

  async deleteProduct(id: string, userId: string): Promise<ResponseBody<string>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    const product = await this.productRepo
      .createQueryBuilder()
      .where('sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('id = :id', { id: id })
      .andWhere('deleted_at IS NULL').getOne();
    if (product === undefined) {
      throw new BadRequestException(new ResponseBody(null,
         "user is not authorized to delete product or product doesn't exist with id [" + id + "]"))
    }
    product.deleted_at = new Date()
    await this.productRepo.save(product)
    return new ResponseBody("product with id [" + id + "] deleted");
  }

  async getProducts(userId: string, query: ShopProductQuery): Promise<ResponseListBody<any[]>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId })
      .andWhere('is_active IS TRUE').getOne();
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = this.productRepo
      .createQueryBuilder('products')
      .where('products.sellerId = :sellerId', { sellerId: seller.id })
      .andWhere('products.deleted_at IS NULL');
    if (query.search) {
      queryBuilder = queryBuilder.andWhere('LOWER(products.name) LIKE :name', {
        name: `%${query.search.toLowerCase()}%`,
      });
    }
    if (query.categories) {
      const paramCategories = query.categories.split(',')
      let categoryIds:string[] = []
      for (var index in paramCategories) {
        categoryIds.push("'" + paramCategories[index] + "'")
      }
      let categoryQuery = "(" + categoryIds.join(',') + ")"
      queryBuilder = queryBuilder.andWhere("products.categoryId IN " + categoryQuery);
    }
    queryBuilder = queryBuilder
      .orderBy('products.created_at', 'DESC')
      .addOrderBy('products.name', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .innerJoin('products.category', 'categories')
      .select(
        `products.id AS id,
        products.name AS name,
        products.discount AS discount,
        products.price_per_quantity AS price_per_quantity,
        products.images AS images`,
      )
      .addSelect([
        'categories.name AS category_name',
        'categories.id AS category_id',
      ]);
    let products: any[] = await queryBuilder.execute();
    products = products.map(p => ({
      ...p,
      images: p.images.split(','),
    }));
    return new ResponseListBody(products, "ok", query.page, products.length)
  }

  async getShopByUserId(userId: string) {
    const shop = await this.sellerRepo.findOneOrFail({ where: { user: { id: userId } } })
    return shop
  }
}
