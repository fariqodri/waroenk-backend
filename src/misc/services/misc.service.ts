import { Injectable } from '@nestjs/common';
import { ResponseListBody, ResponseBody } from '../../utils/response';
import { FaqRepository } from '../repositories/faq.repository';
import { FaqQuery, LocationQuery } from '../dto/misc.dto';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { UserEntity } from '../../users/entities/users.entity';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../../constants';
import { SellerAttribute } from '../../users/entities/seller.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { CategoryRepository } from '../../products/repositories/category.repository';
import { FaqEntity } from '../entities/faq.entity';
import { SellerCategory } from '../../products/entities/seller-category.entity';
import { SellerCategoryRepository } from '../../products/repositories/seller-category.repository';

const { Readable } = require('stream');

function bufferToStream(binary) {

    const readableInstanceStream = new Readable({
      read() {
        this.push(binary);
        this.push(null);
      }
    });

    return readableInstanceStream;
}

class UserParsed {
  full_name: string
  email: string
  phone: string
}

class SellerParsed {
  email: string
  shop_name: string
  shop_address: string
  description: string
  birth_date: string
  birth_place: string
  gender: string
  image: string
  categories: string
}

class ProductParsed {
  email: string
  product_name: string
  product_images: string
  product_price: number
  category: string
  product_description: string
}

class FaqParsed {
  title: string
  description: string
}

@Injectable()
export class MiscService {
  constructor(
    private faqRepo: FaqRepository,
    private locationRepo: LocationRepository,
    private csvParser: CsvParser,
    private userRepo: UserRepository,
    private sellerRepo: SellerAttributeRepository,
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository,
    private sellerCategoryRepo: SellerCategoryRepository,
  ) {}

  async parseFaq(file: Buffer): Promise<ResponseListBody<any[]>> {
    const stream = bufferToStream(file)
    const entities = await this.csvParser.parse(stream, FaqParsed, null, null, { strict: true, separator: ';' })
    for (let faq of entities.list) {
      let newFaq: FaqEntity = {
        id: nanoid(11),
        title: faq.title,
        description: faq.description,
        created_at: new Date(),
        updated_at: null
      }
      await this.faqRepo.insert(newFaq)
    }
    return new ResponseListBody(entities.list, 'ok', 1, entities.list.length)
  }

  async parseUser(file: Buffer): Promise<ResponseListBody<any[]>> {
    const stream = bufferToStream(file)
    const entities = await this.csvParser.parse(stream, UserParsed, null, null, { strict: true, separator: ';' })
    for (let user of entities.list) {
      const encrypted = await bcrypt.hash(user.email + '_' + user.phone, SALT_ROUNDS)
      let newUser: UserEntity = {
        id: nanoid(11),
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: 'seller',
        password: encrypted,
        created_at: new Date(),
        updated_at: null,
        is_active: true,
      }
      await this.userRepo.insert(newUser)
    }
    return new ResponseListBody(entities.list, 'ok', 1, entities.list.length)
  }

  async parseSeller(file: Buffer): Promise<ResponseListBody<any[]>> {
    const stream = bufferToStream(file)
    const entities = await this.csvParser.parse(stream, SellerParsed, null, null, { strict: true, separator: ';' })
    for (let seller of entities.list) {
      const user = await this.userRepo.findOneOrFail({ email: seller.email })
      const dateParsed = seller.birth_date.split('/')
      let newSeller: SellerAttribute = {
        id: nanoid(11),
        user: user,
        tier: 1,
        description: seller.description,
        shop_name: seller.shop_name,
        shop_address: seller.shop_address,
        birth_date: `${dateParsed[2]}-${dateParsed[1]}-${dateParsed[0]}`,
        birth_place: seller.birth_place,
        gender: seller.gender,
        image: seller.image,
        created_at: new Date(),
        updated_at: null,
        is_active: true,
        activation_date: new Date()
      }
      await this.sellerRepo.insert(newSeller)
      const categories = await this.categoryRepo.find()
      for (let category of categories) {
        let newSellerCategory: SellerCategory = {
          id: nanoid(11),
          seller: newSeller,
          category: category,
          activation_date: new Date(),
          expiry_date: null,
          status: seller.categories.split(',').includes(category.id)? 'paid': 'blocked'
        }
        await this.sellerCategoryRepo.insert(newSellerCategory)
      }
    }
    return new ResponseListBody(entities.list, 'ok', 1, entities.list.length)
  }

  async parseProduct(file: Buffer): Promise<ResponseListBody<any[]>> {
    const stream = bufferToStream(file)
    const entities = await this.csvParser.parse(stream, ProductParsed, null, null, { strict: true, separator: ';' })
    for (let product of entities.list) {
      const user = await this.userRepo.findOneOrFail({ email: product.email })
      const seller = await this.sellerRepo.findOneOrFail({
        relations: ['user'],
        where: { user: user.id }
      })
      const category = await this.sellerCategoryRepo.findOneOrFail({
        relations: ['category', 'products'],
        where: { category: product.category, seller: seller.id }
      });
      let newProduct: ProductEntity = {
        id: nanoid(11),
        category: category,
        seller: seller,
        name: product.product_name,
        price_per_quantity: product.product_price,
        discount: 0.00,
        description: product.product_description,
        images: product.product_images.split(','),
        available: true,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
      await this.productRepo.insert(newProduct)
    }
    return new ResponseListBody(entities.list, 'ok', 1, entities.list.length)
  }

  async listLocation(query: LocationQuery): Promise<ResponseBody<any[]>> {
    let index: number = 0
    let queryBuilder = this.locationRepo
      .createQueryBuilder()
      .select('*')
      .orderBy('nama', 'ASC')
      .limit(50);
    if (query.type == 'province') {
      queryBuilder = queryBuilder.andWhere('kode NOT LIKE :regex', {
        regex: '%.%'
      })
    } else if (query.type == 'city') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.__`
      })
      index = 1
    } else if (query.type == 'district') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.${query.city}.__`
      })
      index = 2
    } else if (query.type == 'sub-district') {
      queryBuilder = queryBuilder.where('kode LIKE :regex', {
        regex: `${query.province}.${query.city}.${query.district}.%`
      })
      index = 3
    }
    if (query.search !== undefined && query.search !== '') {
      queryBuilder = queryBuilder.andWhere('LOWER(nama) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`
      })
    }
    let results: any[] = await queryBuilder.execute()
    results = results.map(p => ({
      ...p,
      kode: p.kode.split('.')[index],
      full_kode: p.kode
    }));
    return new ResponseBody(results)
  }

  async listFaqs(query: FaqQuery): Promise<ResponseListBody<any[]>> {
    const skippedItems = (query.page - 1) * query.limit;
    let queryBuilder = this.faqRepo.createQueryBuilder('faq');
    if (query.search !== undefined && query.search !== '') {
      queryBuilder = queryBuilder.andWhere('LOWER(faq.title) LIKE :title', {
        title: `%${query.search.toLowerCase()}%`,
      });
      queryBuilder = queryBuilder.orWhere('LOWER(faq.description) LIKE :description', {
        description: `%${query.search.toLowerCase()}%`,
      });
    }
    queryBuilder = queryBuilder
      .orderBy('faq.created_at', 'DESC')
      .addOrderBy('faq.title', 'ASC')
      .offset(skippedItems)
      .limit(query.limit)
      .select(
        `faq.id AS id,
        faq.title AS title,
        faq.description AS description`,
      );
    let faqs: any[] = await queryBuilder.execute();
    return new ResponseListBody(faqs, "ok", query.page, faqs.length)
  }

  async getLocationByCode(code: string) {
    return this.locationRepo.findOneOrFail(code)
  }
}