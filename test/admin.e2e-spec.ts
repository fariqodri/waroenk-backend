import { INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository } from "typeorm";
import { AdminModule } from "../src/admin/admin.module";
import { entities, fakeRedisClientProvider, fakeJwtAuthGuardFactory } from "./dependencies";
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RedisClientProvider } from "../src/redis/redis.client.provider";

describe('Admin e2e', () => {
    let app: INestApplication;

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
      created_at: new Date(2021, 9),
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
      has_paid: false,
      is_blocked: false,
      activation_date: null
    }
    const buyers: UserEntity[] = [
      user1,
      {
        id: 'user-2',
        full_name: 'user 2',
        email: 'user_2@example.com',
        phone: '0812232112',
        role: 'buyer',
        password: 'hehe1234',
        created_at: new Date(2020, 9),
        updated_at: null,
        is_active: true
      },
      {
        id: 'user-3',
        full_name: 'user 3',
        email: 'user_3@example.com',
        phone: '0812232112',
        role: 'buyer',
        password: 'hehe1234',
        created_at: new Date(2019, 9),
        updated_at: null,
        is_active: false
      }
    ]
    
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
        .useValue(fakeJwtAuthGuardFactory({ userId: 'admin-1', role: 'admin' }))
        .overrideProvider(RedisClientProvider)
        .useValue(fakeRedisClientProvider)
        .compile()
      
      app = moduleFixture.createNestApplication()
      await app.init()
  
      await getRepository(UserEntity).insert([admin, ...buyers])
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

    it('should list buyers sorted from oldest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=asc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
    })

    it('should list buyers sorted from newest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=desc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
    })

    it('should list buyers sorted by full name ascending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=asc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
    })

    it('should list buyers sorted by full name descending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=desc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
    })

    it('should limit buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-1')
    })

    it('should paginate buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1&page=2')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
    })

    it('should get active buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=1')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
    })

    it('should get inactive buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=0')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-3')
    })

    it('should search buyer by name', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?name=2')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
    })
  })