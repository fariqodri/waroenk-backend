import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { AuthModule } from '../src/auth/auth.module'
import { UsersModule } from '../src/users/users.module';
import { JwtStrategy } from '../src/auth/providers/jwt.strategy';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RedisModule } from '../src/redis/redis.module';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection } from 'typeorm';
import { UsersService } from '../src/users/services/users.service';
import { ProductEntity } from '../src/products/entities/product.entity';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';

describe('Login and Logout E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const fakeJwtStrategyProvider = {
      handleRequest: jest.fn().mockReturnValue(true)
    }
    const fakeJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true)
    }
    const fakeRedisClientProvider = {
      set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
      get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
    }
    const fakeJwtService = {
      decode: jest.fn().mockReturnValue({ iat: 1, exp: 2 }),
      sign: jest.fn().mockReturnValue('fake_token')
    }
    
    const moduleFixture = await Test.createTestingModule({
      imports: [
        RedisModule.register({}),
        AuthModule,
        UsersModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity, UserEntity, SellerAttribute, ProductEntity]
        })
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue(fakeJwtStrategyProvider)
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .overrideProvider(JwtService)
      .useValue(fakeJwtService)
      .compile();
    app = moduleFixture.createNestApplication()
    await app.init()

    getConnection()
      .getRepository(UserEntity)
      .insert({
        id: 'user-1',
        email: 'user@example.com',
        full_name: 'user 1',
        password: 'password1234',
        role: 'buyer',
        phone: '0821321321'
      })
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('logout should return OK', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set("Authorization", "Bearer fake_token")
      .expect(200)
      .expect({
        "message": "ok",
        "result": null
      })
  })

  it('login should return OK on valid body', () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(200)
      .send({
        email: 'user@example.com',
        password: 'password1234'
      })
      .expect({
        message: 'ok',
        result: {
          access_token: 'fake_token'
        }
      })
  })

  it('login should return error on invalid body', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(400)
      .send({
        email: 'user',
        password: 'password1234'
      })
  })

  it('login should return error on invalid email', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(400)
      .send({
        email: 'wrongEmail@gmail.com',
        password: 'password1234'
      })
      .expect({
        message: 'invalid email',
        result: null
      })
  })
})
