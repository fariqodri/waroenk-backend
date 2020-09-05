import { entities, fakeJwtAuthGuardFactory, fakeRedisClientProvider } from './dependencies';
import { UserEntity } from '../src/users/entities/users.entity';
import * as request from 'supertest';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { AuthModule } from '../src/auth/auth.module';
import { RedisModule } from '../src/redis/redis.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { PostEntity } from '../src/post/post.entity';
import { ShopModule } from '../src/shop/shop.module';
import { INestApplication } from '@nestjs/common';
import { getRepository, getConnection } from 'typeorm';
import { Test } from '@nestjs/testing';
import { PostModule } from '../src/post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Post E2E', () => {
  let app: INestApplication
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
    description: 'lalala1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    tier: 2,
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    activation_date: new Date()
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        PostModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: entities,
        }),
        AuthModule,
        RedisModule.register({}),
        ShopModule
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuardFactory({ userId: 'user-1', role: 'seller' }))
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    await getRepository(UserEntity).insert(user)
    await getRepository(SellerAttribute).insert(seller)
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('should create post', async () => {
    const resp = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'title',
        content: 'hello world',
        image: 'image-url'
      })
      .expect(201)
    const { result } = resp.body
    const { id, title, content } = result
    expect(id).toBeDefined()
    expect(title).toEqual('title')
    expect(content).toEqual('hello world')

    const post = await getRepository(PostEntity).findOneOrFail(id)
    expect(post.title).toEqual('title')
    expect(post.content).toEqual('hello world')
    expect(post.image).toEqual('image-url')
  })

  it("should fail if seller's tier is under required tier", async () => {
    await getRepository(SellerAttribute).update('seller-1', { tier: 1 })
    const resp = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: 'title',
        content: 'hello world'
      })
      .expect(406)
      .expect({
        message: "your tier is below the required tier for creating posts",
        result: null
      })
  })

  it('should get seller\'s posts', async () => {
    await getRepository(PostEntity).insert([
      {
        id: 'post-1',
        title: 'title 1',
        content: 'hello',
        image: 'image-url',
        seller: seller,
        created_at: new Date(2020, 9)
      },
      {
        id: 'post-2',
        title: 'title 2',
        content: 'world',
        seller: seller,
        created_at: new Date(2020, 3)
      },
    ])
    await request(app.getHttpServer())
      .get('/posts/seller/seller-1?page=1&limit=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'post-1',
            title: 'title 1',
            content: 'hello',
            image: 'image-url',
          }
        ],
        page: 1,
        limit: 1,
        total: 2
      })
    await request(app.getHttpServer())
      .get('/posts/seller/seller-1?sort=oldest')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'post-2',
            title: 'title 2',
            content: 'world',
            image: null
          },
          {
            id: 'post-1',
            title: 'title 1',
            content: 'hello',
            image: 'image-url',
          }
        ],
        page: 1,
        limit: 10,
        total: 2
      })
    await request(app.getHttpServer())
      .get('/posts/seller/seller-1?sort=latest')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'post-1',
            title: 'title 1',
            content: 'hello',
            image: 'image-url',
          },
          {
            id: 'post-2',
            title: 'title 2',
            content: 'world',
            image: null
          }
        ],
        page: 1,
        limit: 10,
        total: 2
      })
    await request(app.getHttpServer())
      .get('/posts/seller/seller-2?sort=latest')
      .expect(404)
      .expect({
        message: 'seller not found',
        result: null
      })
  })
})