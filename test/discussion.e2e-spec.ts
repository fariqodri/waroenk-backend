import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { DiscussionModule } from '../src/discussion/discussion.module';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RedisClientProvider } from '../src/redis/redis.client.provider';

const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}

describe('Discussion (e2e)', () => {
  let app: INestApplication;

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'seller' }
      return true
    })
  }
  const vegetableCategory = { id: 'category-1', name: 'Sayuran', image: 's3_url_1' };
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

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        DiscussionModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            DiscussionEntity,
            UserEntity,
            ProductEntity,
            CategoryEntity,
            SellerAttribute
          ],
        }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()

    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(UserEntity).insert([user])
    await getRepository(SellerAttribute).insert([seller])
    await getRepository(CategoryEntity).insert([vegetableCategory])
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
          created_at: '2020-06-30 19:32:30',
          updated_at: null
        },
      ])
  });

  afterEach(async () => {
    await getConnection().close();
  });
  
  it('should return newly created discussion when create discussion', () => {
    const reqBody = {
      productId: 'product_1',  
      description: 'why are you gae',
    }
    return request(app.getHttpServer())
      .post('/discussion')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, product, description, created_at, updated_at, deleted_at } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(product.id).toEqual(reqBody.productId)
        expect(description).toEqual(reqBody.description)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeNull()
        expect(deleted_at).toBeNull()
      })
  });
});
