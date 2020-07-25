import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../src/products/products.module';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection, getRepository } from 'typeorm';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { OptionalJwtAuthGuard } from '../src/auth/guards/optional-jwt-auth.guard';
import { AuthModule } from '../src/auth/auth.module';
import { RedisModule } from '../src/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';

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
    tier: 1,
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
            DiscussionEntity
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
        seller: seller,
        created_at: new Date('123')
      },
      {
        id: 'product_2',
        name: 'kangkung amerika',
        price_per_quantity: 5000,
        discount: 0,
        description: 'bayam',
        images: ['1'],
        category: vegetableCategory,
        seller: seller,
        created_at: new Date('124')
      },
      {
        id: 'product_3',
        name: 'Jeruk',
        price_per_quantity: 20000,
        discount: 0,
        description: 'jeruk',
        images: ['1'],
        category: fruitsCategory,
        seller: seller,
        created_at: new Date('125')
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
            discount: 0,
            description: 'kangkung',
            images: ['1'],
            category: vegetableCategory.name,
            seller_name: seller.shop_name,
            seller_id: seller.id
          }
        ],
        page: 1,
        limit: 10,
      });
  });

  it('Query products without results', () => {
    return request(app.getHttpServer())
      .get('/products?search=AngkUng&price_from=20000&price_to=30000&category=category-1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [],
        page: 1,
        limit: 10,
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
            discount: 0,
            description: 'kangkung',
            images: ['1'],
            category: vegetableCategory.name,
            seller_name: seller.shop_name,
            seller_id: seller.id
          },
          {
            id: 'product_2',
            name: 'kangkung amerika',
            price_per_quantity: 5000,
            discount: 0,
            description: 'bayam',
            images: ['1'],
            category: vegetableCategory.name,
            seller_name: seller.shop_name,
            seller_id: seller.id
          },
          {
            id: 'product_3',
            name: 'Jeruk',
            price_per_quantity: 20000,
            discount: 0,
            description: 'jeruk',
            images: ['1'],
            category: fruitsCategory.name,
            seller_name: seller.shop_name,
            seller_id: seller.id
          }
        ],
        page: 1,
        limit: 10,
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
            seller_name: seller.shop_name,
            seller_id: seller.id
          },
        ],
        page: 2,
        limit: 1,
      })
  })

  it('Query product with sort by newest', () => {
    return request(app.getHttpServer())
      .get('/products?sort_by=newest&page=1&limit=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_3',
            name: 'Jeruk',
            price_per_quantity: 20000,
            discount: 0,
            description: 'jeruk',
            images: ['1'],
            category: fruitsCategory.name,
            seller_name: seller.shop_name,
            seller_id: seller.id
          }
        ],
        page: 1,
        limit: 1,
      })
  })

  it('Get product by ID success', () => {
    return request(app.getHttpServer())
      .get('/products/product_1')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          id: 'product_1',
          name: 'KangKunG',
          price_per_quantity: 10000,
          seller: {
            id: seller.id,
            name: seller.shop_name,
            address: seller.shop_address,
            image: seller.image,
            is_active: seller.is_active,
            tier: seller.tier
          },
          discount: 0,
          description: 'kangkung',
          images: ['1'],
          category: {
            id: vegetableCategory.id,
            name: vegetableCategory.name,
            image: vegetableCategory.image
          }
        }
      })
  })

  it('Get product by ID not found', () => {
    return request(app.getHttpServer())
      .get('/products/wrong_product')
      .expect(404)
      .expect({
        message: 'product wrong_product not found',
        result: null
      })
  })
});

const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}

describe('GET Product and Categories (e2e) with user login', () => {
  let app: INestApplication;
  const fakeOptionalJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      if (req.headers.authorization) {
        req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'seller' }
      }
      return true
    })
  }
  const vegetableCategory = { id: 'category-1', name: 'Sayuran', image: 's3_url_1' };
  const fruitsCategory = { id: 'category-2', name: 'Buah-buahan', image: 's3_url_1' };
  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'seller',
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
    tier: 1,
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true
  }
  const fakeAuthService = {
    decode: (token: string) => ({ userId: 'user-1' })
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
            DiscussionEntity
          ],
        }),
      ],
    })
    .overrideProvider(RedisClientProvider)
    .useValue(fakeRedisClientProvider)
    .overrideGuard(OptionalJwtAuthGuard)
    .useValue(fakeOptionalJwtAuthGuard)
    .compile()
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
        seller: seller,
        created_at: new Date('123')
      },
      {
        id: 'product_2',
        name: 'kangkung amerika',
        price_per_quantity: 5000,
        discount: 0,
        description: 'bayam',
        images: ['1'],
        category: vegetableCategory,
        seller: seller,
        created_at: new Date('124')
      },
      {
        id: 'product_3',
        name: 'Jeruk',
        price_per_quantity: 20000,
        discount: 0,
        description: 'jeruk',
        images: ['1'],
        category: fruitsCategory,
        seller: seller,
        created_at: new Date('125')
      },
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it('Get product by ID success with login', () => {
    return request(app.getHttpServer())
      .get('/products/product_1')
      .set('Authorization', 'Bearer fake_token')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          id: 'product_1',
          name: 'KangKunG',
          price_per_quantity: 10000,
          seller: {
            id: seller.id,
            name: seller.shop_name,
            address: seller.shop_address,
            image: seller.image,
            is_active: seller.is_active,
            tier: seller.tier
          },
          discount: 0,
          description: 'kangkung',
          images: ['1'],
          category: {
            id: vegetableCategory.id,
            name: vegetableCategory.name,
            image: vegetableCategory.image
          },
          is_my_product: true
        }
      })
  })
})