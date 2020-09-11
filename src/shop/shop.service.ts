import { Injectable, BadRequestException, Param } from '@nestjs/common';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { ShopProductQuery, ProductCreateParam, ProductEditParam, ShopPostParam, SellerBankParam, EditSellerBankParam } from './shop.dto';
import { ResponseBody, ResponseListBody } from '../utils/response';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { ProductEntity } from '../products/entities/product.entity';
import { SellerAttribute } from '../users/entities/seller.entity';
import { nanoid } from 'nanoid';
import { OrderQueryParam } from '../order/dto/order.dto';
import { Like, In } from 'typeorm';
import { OrderRepository } from '../order/repositories/order.repository';
import { SellerBankRepository } from '../users/repositories/selle-bank.repository';
import { SellerBank } from '../users/entities/seller-bank.entity';
import { SellerCategoryRepository } from '../products/repositories/seller-category.repository';
import { SellerCategory } from '../products/entities/seller-category.entity';

@Injectable()
export class ShopService {
  constructor(
    private productRepo: ProductRepository,
    private sellerRepo: SellerAttributeRepository,
    private categoryRepo: CategoryRepository,
    private userRepo: UserRepository,
    private orderRepo: OrderRepository,
    private sellerBankRepo: SellerBankRepository,
    private sellerCategoryRepo: SellerCategoryRepository
  ) {}

  async createBank(userId: string, param: SellerBankParam): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail({
      relations: ['user'],
      where: { user: userId }
    });
    const newBank: SellerBank = {
      id: nanoid(11),
      seller: seller,
      bank: param.bank,
      number: param.number,
      owner: param.owner,
      is_active: true,
      created_at: new Date(),
      updated_at: null
    }
    await this.sellerBankRepo.insert(newBank)
    const response = {
      id: newBank.id,
      sellerId: seller.id,
      bank: param
    }
    return new ResponseBody(response)
  }

  async editBank(userId: string, id: string, param: EditSellerBankParam): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail({
      relations: ['user'],
      where: { user: userId }
    });
    let editedBank = await this.sellerBankRepo.findOneOrFail(id, {
      relations: ['seller'],
      where: { seller: seller.id, is_active: true}
    })
    if (param.bank) {
      editedBank.bank = param.bank
    }
    if (param.number) {
      editedBank.number = param.number
    }
    if (param.owner) {
      editedBank.owner = param.owner
    }
    editedBank.updated_at = new Date()
    await this.sellerBankRepo.save(editedBank)
    return new ResponseBody(null, 'bank edited')
  }

  async deleteBank(userId: string, id: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail({
      relations: ['user'],
      where: { user: userId }
    });
    let deletedBank = await this.sellerBankRepo.findOneOrFail(id, {
      relations: ['seller'],
      where: { seller: seller.id, is_active: true}
    })
    deletedBank.is_active = false
    await this.sellerBankRepo.save(deletedBank)
    return new ResponseBody(null, 'bank deleted')
  }

  async listBank(sellerId: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail(sellerId)
    let banks = await this.sellerBankRepo.find({
      relations: ['seller'],
      where: { seller: seller.id, is_active: true}
    })
    return new ResponseBody(banks)
  }

  async detailBank(id: string): Promise<ResponseBody<any>> {
    const bank = await this.sellerBankRepo.findOneOrFail(id)
    return new ResponseBody(bank)
  }

  async getShop(id: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail(id);
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `there is no shop with id: [${id}]`))
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
      tier: seller.tier,
      is_active: seller.is_active
    }
    return new ResponseBody(response);
  }

  async createShop(userId: string, param: ShopPostParam): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId }).getOne();
    if (seller != undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `there is existing shop with userId: [${userId}]`))
    }
    const user = await this.userRepo
      .createQueryBuilder()
      .where('id = :userId', { userId: userId })
      .andWhere('is_active IS TRUE')
      .andWhere("role = 'buyer'").getOne();
    if (user === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `user with userId: [${userId}] is not a buyer or not active so it can't create shop`))
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
      activation_date: null,
      is_active: false
    }
    await this.sellerRepo.insert(newSeller)
    const categories = await this.categoryRepo.find()
    for (let category of categories) {
      const newSellerCategory: SellerCategory = {
        id: nanoid(11),
        seller: newSeller,
        category: category,
        activation_date: null,
        expiry_date: null,
        status: param.proposed_category.includes(category.id)? 'proposed': 'blocked'
      }
      await this.sellerCategoryRepo.insert(newSellerCategory)
    }
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
      .where('userId = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `there is no shop with userId: [${userId}] or shop not activated or blocked`))
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

  async getEligibleCategories(userId: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo
    .createQueryBuilder()
    .where('userId = :userId', { userId: userId })
    .andWhere('is_active IS TRUE').getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `seller with userId: [${userId}] is inactive so it can't create product`))
    }
    const sellerCategories = await this.sellerCategoryRepo.find({
      relations: ['category', 'products'],
      where: { seller: seller.id, status: In(['paid', 'not_paid']) }
    })
    let eligibleCategories = []
    for (let category of sellerCategories) {
      const productCount = await this.productRepo.count({
        relations: ['category'],
        where: {
          deleted_at: null,
          category: {
            category: category.category.id,
            seller: seller.id,
          }
        }
      })
      if (productCount < 5) {
        eligibleCategories.push({
          id: category.category.id,
          name: category.category.name
        })
      }
    }
    return new ResponseBody(eligibleCategories)
  }

  async createProduct(userId: string, param: ProductCreateParam): Promise<ResponseBody<ProductEntity>> {
    const seller = await this.sellerRepo
      .createQueryBuilder()
      .where('userId = :userId', { userId: userId })
      .andWhere('is_active IS TRUE').getOne();
    if (seller === undefined) {
      throw new BadRequestException(new ResponseBody(null,
        `seller with userId: [${userId}] is inactive so it can't create product`))
    }
    const category = await this.sellerCategoryRepo.findOneOrFail({
      relations: ['category', 'products'],
      where: { category: param.categoryId, seller: seller.id }
    });
    const productCount = await this.productRepo.count({
      relations: ['category'],
      where: {
        deleted_at: null,
        category: {
          category: category.category.id,
          seller: seller.id,
        }
      }
    })
    if (productCount >= 5) {
      throw new BadRequestException(new ResponseBody(null,
        `category of ${category.category.id} of user ${userId} is full `))
    }
    let discount = 0.00
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
        `seller with userId: [${userId}] is inactive so it can't edit product`))
    }
    let product = await this.productRepo.findOneOrFail(id, {
      relations: ['seller', 'category'],
      where: { seller: seller.id }
    })
    if (param.categoryId) {
      const category = await this.sellerCategoryRepo.findOneOrFail({
        relations: ['category', 'products'],
        where: { 
          category: param.categoryId,
          seller: seller.id, 
          status: In(['paid', 'not_paid']) }
      });
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
    if (param.available !== undefined) {
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
    product.available = false
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
      queryBuilder = queryBuilder.andWhere("sellerCategory.categoryId IN " + categoryQuery);
    }
    queryBuilder = queryBuilder
      .orderBy('products.created_at', 'DESC')
      .addOrderBy('products.name', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .innerJoin('products.category', 'sellerCategory')
      .innerJoin('sellerCategory.category', 'category')
      .select(
        `products.id AS id,
        products.name AS name,
        products.discount AS discount,
        products.price_per_quantity AS price_per_quantity,
        products.images AS images,
        products.available AS available`,
      )
      .addSelect([
        'category.name AS category_name',
        'category.id AS category_id',
      ]);
    let products: any[] = await queryBuilder.execute();
    products = products.map(p => ({
      ...p,
      images: p.images.split(','),
      discount: Number(p.discount) == 0? 0.00: Number(p.discount),
      available: p.available? true: false
    }));
    return new ResponseListBody(products, "ok", query.page, products.length)
  }

  async listSellerOrder(param: OrderQueryParam, userId: string): Promise<ResponseBody<any>> {
    const seller = await this.sellerRepo.findOneOrFail({
      relations: ['user'],
      where: { user: userId }
    })
    const skippedItems = (param.page - 1) * param.limit;
    const orders = await this.orderRepo.find({
      relations: ['user', 'items', 'seller'],
      where: {
        seller: seller.id,
        status: Like(param.status == ''? '%%': param.status)
      },
      order: { created_at: 'DESC' },
      skip: skippedItems,
      take: param.limit
    })
    const response = orders.map(p => ({
      ...p,
      buyerId: p.user.id,
      buyerName: p.user.full_name,
      totalItem: p.items.reduce(function(prev, cur) {
        return prev + cur.quantity;
      }, 0),
      subTotal: p.fare + p.items.reduce(function(prev, cur) {
        return prev + 
          (cur.product.price_per_quantity * (1 - cur.product.discount)) * cur.quantity;
      }, 0)
    }));
    response.forEach(function(p) {
      delete p.user
      delete p.items
      delete p.seller
    })
    return new ResponseListBody(response, 'ok', param.page, orders.length)
  }
}
