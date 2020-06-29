import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../src/products/products.module';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection, getRepository } from 'typeorm';
import { nanoid } from 'nanoid';
import { SellerAttribute } from '../src/users/entities/seller.entity';

describe('GET Product and Categories (e2e)', () => {
  let app: INestApplication;
  const id_1 = nanoid(11),
    id_2 = nanoid(11);
  const vegetableCategory = { id: id_1, name: 'Sayuran', image: 's3_url_1' };
  const fruitsCategory = { id: id_2, name: 'Buah-buahan', image: 's3_url_1' };
  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'buyer',
    password: 'hehe1234',
  };
  const seller: SellerAttribute = {
    id: 'seller-1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    user: user,
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            CategoryEntity,
            UserEntity,
            SellerAttribute,
            ProductEntity,
          ],
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CategoryEntity)
      .values([vegetableCategory, fruitsCategory])
      .execute();
    await getRepository(UserEntity).insert(user);
    await getRepository(SellerAttribute).insert(seller)
    await getRepository(ProductEntity).insert([
      {
        id: 'product_1',
        name: 'KangKunG',
        price_per_quantity: 10000,
        discount: 0,
        description: 'kangkung',
        images: ['1'],
        category: vegetableCategory,
        seller: seller
      },
      {
        id: 'product_2',
        name: 'Bayam',
        price_per_quantity: 10000,
        discount: 0,
        description: 'bayam',
        images: ['1'],
        category: vegetableCategory,
        seller: seller
      }
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it(`/GET categories`, () => {
    return request(app.getHttpServer())
      .get('/categories')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: id_1,
            name: 'Sayuran',
            image: 's3_url_1',
          },
          {
            id: id_2,
            name: 'Buah-buahan',
            image: 's3_url_1',
          },
        ],
      });
  });

  it(`/GET categories?sayuran`, () => {
    return request(app.getHttpServer())
      .get('/categories?search=sayuran')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: id_1,
            name: 'Sayuran',
            image: 's3_url_1',
          },
        ],
      });
  });

  it('Query products by name', () => {
    return request(app.getHttpServer())
      .get('/products?search=AngkUng')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_1',
            name: 'KangKunG',
            price_per_quantity: 10000,
            seller_name: seller.shop_name,
            discount: 0,
            description: 'kangkung',
            images: ['1'],
            category: vegetableCategory.name
          }
        ],
      });
  });

  it('Query product without search', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_1',
            name: 'KangKunG',
            price_per_quantity: 10000,
            seller_name: seller.shop_name,
            discount: 0,
            description: 'kangkung',
            images: ['1'],
            category: vegetableCategory.name
          },
          {
            id: 'product_2',
            name: 'Bayam',
            price_per_quantity: 10000,
            seller_name: seller.shop_name,
            discount: 0,
            description: 'bayam',
            images: ['1'],
            category: vegetableCategory.name
          }
        ],
      });
  })
});
