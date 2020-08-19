import { ExecutionContext, INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository } from "typeorm";
import { AdminModule } from "../src/admin/admin.module";
import { entities } from "./dependencies";
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RedisClientProvider } from "../src/redis/redis.client.provider";

const fakeRedisClientProvider = {
    set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
    get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
  }

describe('Admin e2e', () => {
    let app: INestApplication;
  
    const fakeJwtAuthGuard = {
      canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { userId: 'admin-1', issuedAt: 1, expiredAt: 2, role: 'admin' }
        return true
      })
    }

    const admin: UserEntity = {
      id: 'admin-1',
      full_name: 'admin 1',
      email: 'admin@example.com',
      phone: '0814232112',
      role: 'admin',
      password: 'hehe1234',
      created_at: new Date(),
      updated_at: null,
      is_active: true
    }
    const user1: UserEntity = {
      id: 'user-1',
      full_name: 'user 1',
      email: 'user@example.com',
      phone: '0812232112',
      role: 'buyer',
      password: 'hehe1234',
      created_at: new Date(),
      updated_at: null,
      is_active: true
    }
    const sellerNotActivated: SellerAttribute = {
      id: 'seller-1',
      description: 'lalala1',
      shop_name: 'Toko Sayur',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user1,
      created_at: new Date(),
      updated_at: null,
      is_active: false,
      has_paid: false
    }
    
    beforeEach(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          AdminModule,
          TypeOrmModule.forRoot({
            type: "sqlite",
            database: ":memory:",
            dropSchema: true,
            synchronize: true,
            entities: entities,
          }),
          AuthModule,
          RedisModule.register({}),
          JwtModule.register({})
        ]
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtAuthGuard)
        .overrideProvider(RedisClientProvider)
        .useValue(fakeRedisClientProvider)
        .compile()
      
      app = moduleFixture.createNestApplication()
      await app.init()
  
      await getRepository(UserEntity).insert([admin, user1])
      await getRepository(SellerAttribute).insert([sellerNotActivated])
    })

    afterEach(async () => {
      await getConnection().close();
    });
  
    it('activate seller', () => {
      return request(app.getHttpServer())
        .put('/admin/seller/seller-1')
        .expect(201)
        .then(res => {
          const body = res.body
          const { message, result } = body
          expect(message).toEqual('seller activated')
          expect(result).toBeNull()
        })
    })
  })