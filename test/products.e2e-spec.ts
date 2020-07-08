import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../src/products/products.module';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection, getRepository } from 'typeorm';
import { SellerAttribute } from '../src/users/entities/seller.entity';

describe('GET Product and Categories (e2e)', () => {
  let app: INestApplication;
  const vegetableCategory = { id: 'category-1', name: 'Sayuran', image: 's3_url_1' };
  const fruitsCategory = { id: 'category-2', name: 'Buah-buahan', image: 's3_url_1' };
  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'buyer',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const seller: SellerAttribute = {
    id: 'seller-1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true
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
        name: 'kangkung amerika',
        price_per_quantity: 5000,
        discount: 0,
        description: 'bayam',
        images: ['1'],
        category: vegetableCategory,
        seller: seller
      },
      {
        id: 'product_3',
        name: 'Jeruk',
        price_per_quantity: 20000,
        discount: 0,
        description: 'jeruk',
        images: ['1'],
        category: fruitsCategory,
        seller: seller
      },
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
            id: 'category-1',
            name: 'Sayuran',
            image: 's3_url_1',
          },
          {
            id: 'category-2',
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
            id: 'category-1',
            name: 'Sayuran',
            image: 's3_url_1',
          },
        ],
      });
  });
  

  it('Query products with results', () => {
    return request(app.getHttpServer())
      .get('/products?search=AngkUng&price_from=5001&price_to=20000&category=category-1')
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

  it('Query products without results', () => {
    return request(app.getHttpServer())
      .get('/products?search=AngkUng&price_from=20000&price_to=30000&category=category-1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [],
      });
  })

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
            name: 'kangkung amerika',
            price_per_quantity: 5000,
            seller_name: seller.shop_name,
            discount: 0,
            description: 'bayam',
            images: ['1'],
            category: vegetableCategory.name
          },
          {
            id: 'product_3',
            name: 'Jeruk',
            price_per_quantity: 20000,
            discount: 0,
            description: 'jeruk',
            images: ['1'],
            category: fruitsCategory.name,
            seller_name: seller.shop_name
          }
        ],
      });
  })

  it('Query product with sort by price', () => {
    return request(app.getHttpServer())
      .get('/products?sort_by=price&sort_type=desc&page=2&limit=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_1',
            name: 'KangKunG',
            price_per_quantity: 10000,
            discount: 0,
            description: 'kangkung',
            images: ['1'],
            category: vegetableCategory.name,
            seller_name: seller.shop_name
          },
        ]
      })
  })
});
