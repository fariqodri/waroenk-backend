import { INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository, Between } from "typeorm";
import { AdminModule } from "../src/admin/admin.module";
import { entities, fakeRedisClientProvider, fakeJwtAuthGuardFactory } from "./dependencies";
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RedisClientProvider } from "../src/redis/redis.client.provider";
import { OrderEntity } from "../src/order/entities/order.entity";
import { ProposalEntity } from "../src/proposal/entities/proposal.entity";

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
    const user2: UserEntity = {
      id: 'user-2',
      full_name: 'user 2',
      email: 'user_2@example.com',
      phone: '0812232112',
      role: 'buyer',
      password: 'hehe1234',
      created_at: new Date(2020, 9),
      updated_at: null,
      is_active: true
    }
    const user3: UserEntity = {
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
    const user4: UserEntity = {
      id: 'user-4',
      full_name: 'user 4',
      email: 'user_4@example.com',
      phone: '08122342112',
      role: 'seller',
      password: 'hehe1234',
      created_at: new Date(2019, 8),
      updated_at: null,
      is_active: true
    }
    const sellerNotActivated: SellerAttribute = {
      id: 'seller-1',
      description: 'lalala1',
      shop_name: 'Toko Sayur a',
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
    const seller2: SellerAttribute = {
      id: 'seller-2',
      description: 'lalala2',
      shop_name: 'Toko Sayur b',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user2,
      created_at: new Date(2020, 1),
      updated_at: null,
      is_active: true,
      has_paid: true,
      is_blocked: false,
      activation_date: new Date()
    }
    const seller3: SellerAttribute = {
      id: 'seller-3',
      description: 'lalala3',
      shop_name: 'Toko Sayur c',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user3,
      created_at: new Date(2020, 2),
      updated_at: null,
      is_active: true,
      has_paid: true,
      is_blocked: false,
      activation_date: new Date()
    }
    const seller4: SellerAttribute = {
      id: 'seller-4',
      description: 'lalala4',
      shop_name: 'Toko Sayur d',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 2,
      user: user4,
      created_at: new Date(),
      updated_at: null,
      is_active: false,
      has_paid: false,
      is_blocked: true,
      activation_date: new Date()
    }
    const buyers: UserEntity[] = [
      user1,
      user2,
      user3
    ]
    const order1: OrderEntity = {
      id: 'order-1',
      user: user4,
      seller: seller2,
      status: 'new',
      address: 'jalan anggur',
      recipient_name: 'joni',
      recipient_number: '08589239129',
      created_at: new Date(2020, 4, 1, 12),
      fare: 0,
      courier: null,
      notes: null,
      payment_bank: null,
      account_owner: null,
      account_number: null,
      payment_proof: null,
      receipt_number: null,
      updated_at: null,
      items: []
    }
    const order2: OrderEntity = {
      id: 'order-2',
      user: user4,
      seller: seller2,
      status: 'new',
      address: 'jalan anggur',
      recipient_name: 'joni',
      recipient_number: '08589239129',
      created_at: new Date(2020, 4, 2, 12),
      fare: 0,
      courier: null,
      notes: null,
      payment_bank: null,
      account_owner: null,
      account_number: null,
      payment_proof: null,
      receipt_number: null,
      updated_at: null,
      items: []
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
        .useValue(fakeJwtAuthGuardFactory({ userId: 'admin-1', role: 'admin' }))
        .overrideProvider(RedisClientProvider)
        .useValue(fakeRedisClientProvider)
        .compile()
      
      app = moduleFixture.createNestApplication()
      await app.init()
  
      await getRepository(UserEntity).insert([admin, ...buyers, user4])
      await getRepository(SellerAttribute).insert([sellerNotActivated, seller2, seller3, seller4])
      await getRepository(OrderEntity).insert([order1, order2])
    })

    afterEach(async () => {
      await getConnection().close();
    });

    it('should list proposal', async () => {
      const proposal1: ProposalEntity = {
        id: 'proposal-1',
        user: user1,
        type: 'izin',
        created_at: new Date(100),
        is_active: true,
        data: []
      }
      const proposal2: ProposalEntity = {
        id: 'proposal-2',
        user: user2,
        type: 'izin',
        created_at: new Date(101),
        is_active: true,
        data: []
      }
      await getRepository(ProposalEntity).insert([proposal1, proposal2])
      const resp = await request(app.getHttpServer())
        .get('/admin/proposal')
        .expect(200)
      const { result, total } = resp.body
      expect(result.length).toEqual(2)
      expect(total).toEqual(2)
      expect(result[0].id).toEqual(proposal2.id)
      expect(result[1].id).toEqual(proposal1.id)
    })

    it('should count order for dashboard', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/order/count?dayFrom=1&monthFrom=5&yearFrom=2020&dayTo=1&monthTo=5&yearTo=2020')
        .expect(200)
      const { result } = resp.body
      expect(result.count).toEqual(1)
    })

    it('should count user for dashboard', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/user/count')
        .expect(200)
      const { result } = resp.body
      expect(result.userCount).toEqual(3)
      expect(result.sellerCount).toEqual(2)
      expect(result.newSellerCount).toEqual(1)
    })

    it('should list buyers sorted from oldest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=asc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted from newest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=desc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted by full name ascending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=asc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted by full name descending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=desc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should limit buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(1)
      expect(total).toEqual(3)
    })

    it('should paginate buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1&page=2')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
      expect(page).toEqual(2)
      expect(limit).toEqual(1)
      expect(total).toEqual(3)
    })

    it('should get active buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=1')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(2)
    })

    it('should get inactive buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=0')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(1)
    })

    it('should search buyer by name', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?name=2')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(1)
    })

    it('should list seller', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(4)
      expect(result[0].id).toEqual('seller-1')
      expect(result[1].id).toEqual('seller-4')
      expect(result[2].id).toEqual('seller-3')
      expect(result[3].id).toEqual('seller-2')
    })

    it('should list paid seller ', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=paid')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('seller-3')
      expect(result[1].id).toEqual('seller-2')
    })

    it('should list paid seller order by name desc', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=paid&sort_by=name&order=asc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('seller-2')
      expect(result[1].id).toEqual('seller-3')
    })

    it('should list blocked seller', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=blocked')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('seller-4')
    })

    it('should list seller by name', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=blocked&name=d')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('seller-4')
    })

    it('should block seller', async () => {
      const body = { blocked: true }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-2')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller has been updated')
      const editedSeller = await getRepository(SellerAttribute).findOne('seller-2')
      expect(editedSeller.is_blocked).toBeTruthy()
      expect(editedSeller.is_active).toBeFalsy()
      expect(editedSeller.has_paid).toBeFalsy()
    })

    it('should unblock seller', async () => {
      const body = { blocked: false }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-4')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller has been updated')
      const editedSeller = await getRepository(SellerAttribute).findOne('seller-4')
      expect(editedSeller.is_blocked).toBeFalsy()
    })

    it('should edit seller', async () => {
      const body = { active: false, paid: false, tier: 2 }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-3')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller has been updated')
      const editedSeller = await getRepository(SellerAttribute).findOne('seller-3')
      expect(editedSeller.is_active).toBeFalsy()
      expect(editedSeller.has_paid).toBeFalsy()
      expect(editedSeller.tier).toEqual(2)
      const editedUser = await getRepository(UserEntity).findOne(user3.id)
        expect(editedUser.role).toEqual('buyer')
    })

    it('activate seller', async () => {
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-1')
        .send({ active: true })
        .expect(201)
        .then(res => {
          const body = res.body
          const { message, result } = body
          expect(message).toEqual('seller has been updated')
          expect(result).toBeNull()
        })
        const editedSeller = await getRepository(SellerAttribute).findOne('seller-1')
        expect(editedSeller.is_active).toBeTruthy()
        const editedUser = await getRepository(UserEntity).findOne(user1.id)
        expect(editedUser.role).toEqual('seller')
    })
  })