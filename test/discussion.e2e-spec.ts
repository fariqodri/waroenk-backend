import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { getConnection, getRepository } from 'typeorm';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { DiscussionModule } from '../src/discussion/discussion.module';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { entities } from './dependencies';
import { SellerCategory } from '../src/products/entities/seller-category.entity';

const fakeRedisClientProvider = {
  set: jest
    .fn()
    .mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
};

describe('Discussion (e2e)', () => {
  let app: INestApplication;

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = {
        userId: 'user-1',
        issuedAt: 1,
        expiredAt: 2,
        role: 'seller',
      };
      return true;
    }),
  };
  const vegetableCategory = {
    id: 'category-1',
    name: 'Sayuran',
    image: 's3_url_1',
  };
  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true,
  };
  const seller: SellerAttribute = {
    id: 'seller-1',
    description: 'lalala',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: 'img-1.com',
    tier: 1,
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    activation_date: new Date()
  };
  const sellerCategory: SellerCategory = {
    id: 'seller-category',
    seller: seller,
    category: vegetableCategory,
    activation_date: new Date(),
    expiry_date: null,
    status: 'paid'
  }
  const product1 = {
    id: 'product_1',
    name: 'KangKunG',
    price_per_quantity: 10000,
    discount: 0,
    description: 'kangkung',
    images: ['1'],
    category: sellerCategory,
    seller: seller,
    created_at: '2020-06-30 19:32:30',
    updated_at: null,
  };
  const product2 = {
    id: 'product_2',
    name: 'KangKunG',
    price_per_quantity: 10000,
    discount: 0,
    description: 'kangkung',
    images: ['1'],
    category: sellerCategory,
    seller: seller,
    created_at: '2020-06-30 19:32:30',
    updated_at: null,
  };
  const discussion1 = {
    id: 'discussion-1',
    user: user,
    product: product1,
    description: 'discussion 1',
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
  };
  const discussions = [
    discussion1,
    {
      id: 'discussion-2',
      user: user,
      product: product1,
      parent: discussion1,
      description: 'discussion 2',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    },
    {
      id: 'discussion-3',
      user: user,
      product: product2,
      description: 'discussion 3',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    },
  ];

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        DiscussionModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          logging: ['error'],
          entities: entities,
        }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(UserEntity).insert([user]);
    await getRepository(SellerAttribute).insert([seller]);
    await getRepository(CategoryEntity).insert([vegetableCategory]);
    await getRepository(SellerCategory).insert(sellerCategory);
    await getRepository(ProductEntity).insert([product1, product2]);
    await getRepository(DiscussionEntity).insert(discussions);
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it('should return newly created discussion when create discussion', () => {
    const reqBody = {
      productId: 'product_1',
      description: 'why are you gae',
    };
    return request(app.getHttpServer())
      .post('/discussion')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const {
          id,
          productId,
          description,
          created_at,
          isSellerProduct
        } = result;
        expect(message).toEqual('ok');
        expect(id).toBeDefined();
        expect(productId).toEqual(reqBody.productId);
        expect(description).toEqual(reqBody.description);
        expect(created_at).toBeDefined();
        expect(isSellerProduct).toBeTruthy();
      });
  });

  it('should return newly created discussion with parent discussion', () => {
    const reqBody = {
      parentId: discussion1.id,
      productId: 'product_1',
      description: 'why are you gae',
    };
    return request(app.getHttpServer())
      .post('/discussion')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const {
          id,
          productId,
          description,
          created_at,
          isSellerProduct,
          parentId
        } = result;
        expect(message).toEqual('ok');
        expect(id).toBeDefined();
        expect(productId).toEqual(reqBody.productId);
        expect(parentId).toEqual(reqBody.parentId);
        expect(description).toEqual(reqBody.description);
        expect(created_at).toBeDefined();
        expect(isSellerProduct).toBeTruthy();
      });
  });

  it('should return list of discussions of product-1', async () => {
    return request(app.getHttpServer())
      .get(`/discussion/product/${product1.id}`)
      .expect(200)
      .then(resp => {
        const body = resp.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result.length).toEqual(2);
        const expectedResult_0 = {
          id: 'discussion-1',
          userId: user.id,
          productId: product1.id,
          parentId: null,
          description: 'discussion 1',
        };
        const expectedResult_1 = {
          id: 'discussion-2',
          userId: user.id,
          productId: product1.id,
          parentId: discussion1.id,
          description: 'discussion 2',
        };
        expect(result[0].id).toEqual(expectedResult_0.id);
        expect(result[0].productId).toEqual(expectedResult_0.productId);
        expect(result[0].description).toEqual(expectedResult_0.description);
        expect(result[0].created_at).toBeDefined()
        expect(result[0].updated_at).toBeDefined()
        expect(result[0].isSellerProduct).toBeTruthy()
        
        expect(result[1].id).toEqual(expectedResult_1.id);
        expect(result[1].productId).toEqual(expectedResult_1.productId);
        expect(result[1].description).toEqual(expectedResult_1.description);
        expect(result[1].created_at).toBeDefined()
        expect(result[1].updated_at).toBeDefined()
        expect(result[1].isSellerProduct).toBeTruthy()
      });
  });

  it('should return list of discussions of product-1 with parent discussion-1', async () => {
    return request(app.getHttpServer())
      .get(`/discussion/product/${product1.id}?parent=${discussion1.id}`)
      .expect(200)
      .then(resp => {
        const body = resp.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result.length).toEqual(1);
        const expectedResult_1 = {
          id: 'discussion-2',
          userId: user.id,
          productId: product1.id,
          parentId: discussion1.id,
          description: 'discussion 2',
        };
        expect(result[0].id).toEqual(expectedResult_1.id);
        expect(result[0].productId).toEqual(expectedResult_1.productId);
        expect(result[0].description).toEqual(expectedResult_1.description);
        expect(result[0].created_at).toBeDefined()
        expect(result[0].updated_at).toBeDefined()
        expect(result[0].isSellerProduct).toBeTruthy()
      });
  });

  it('should return list of discussions of product-2', async () => {
    return request(app.getHttpServer())
      .get(`/discussion/product/${product2.id}?search=discuss`)
      .expect(200)
      .then(resp => {
        const body = resp.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result.length).toEqual(1);
        const expectedResult_0 = {
          id: 'discussion-3',
          userId: user.id,
          productId: product2.id,
          parentId: null,
          description: 'discussion 3',
        };
        expect(result[0].id).toEqual(expectedResult_0.id);
        expect(result[0].productId).toEqual(expectedResult_0.productId);
        expect(result[0].description).toEqual(expectedResult_0.description);
        expect(result[0].created_at).toBeDefined()
        expect(result[0].updated_at).toBeDefined()
        expect(result[0].isSellerProduct).toBeTruthy()
      });
  });
});
