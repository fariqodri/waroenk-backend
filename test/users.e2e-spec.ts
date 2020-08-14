import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../src/constants';

import { UsersModule } from '../src/users/users.module'
import { PermissionService } from '../src/permission/permission.service';
import { PermissionModule } from '../src/permission/permission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { RedisModule } from '../src/redis/redis.module'
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { AgendaEntity } from '../src/agenda/entities/agenda.entity';
import { ProposalEntity } from '../src/proposal/entities/proposal.entity';
import { ProposalData } from '../src/proposal/entities/proposal-data.entity';
import { OrderEntity } from '../src/order/entities/order.entity';
import { OrderItem } from '../src/order/entities/order-item.entity';
import { CartEntity } from '../src/order/entities/cart.entity';

describe('Users E2E', () => {
  let app: INestApplication;
  let permissionService = {
    addMemberToRole: () => jest.fn()
  }
  const fakeRedisClientProvider = {
    set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
    get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
  }
  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer'}
      return true
    })
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PermissionModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [
            CategoryEntity, 
            UserEntity, 
            SellerAttribute, 
            ProductEntity,
            DiscussionEntity,
            AgendaEntity,
            ProposalEntity,
            ProposalData,
            OrderEntity,
            OrderItem,
            CartEntity
          ]
        }),
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({})
      ]
    })
      .overrideProvider(PermissionService)
      .useValue(permissionService)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('Edit User Profile', async () => {
    const reqBody = {
      full_name: "fullo",
      email: "fullo@example.com",
      phone: "081238192322",
      old_password: "password",
      password: "password2",
      confirm_password: "password2",
    }
    getConnection()
      .getRepository(UserEntity)
      .insert({
        id: 'user-1',
        full_name: "full_name",
        email: "full@example.com",
        phone: "081238192312",
        password: await bcrypt.hash('password', SALT_ROUNDS),
        role: 'buyer'
      })
    return request(app.getHttpServer())
      .put('/users')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        expect(message).toEqual('profile has been updated')
        expect(result).toBeNull()
      })
  })

  it('Get User Info', () => {
    getConnection()
      .getRepository(UserEntity)
      .insert({
        id: 'user-1',
        full_name: "full_name",
        email: "full@example.com",
        phone: "081238192312",
        password: "password",
        role: 'buyer'
      })
    return request(app.getHttpServer())
      .get('/users')
      // .set('Authorization', 'fake_token')
      .expect(200)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, full_name, email, phone, role, created_at, is_active, sellerId } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(full_name).toEqual("full_name")
        expect(email).toEqual("full@example.com")
        expect(phone).toEqual("081238192312")
        expect(role).toEqual("buyer")
        expect(created_at).toBeDefined()
        expect(is_active).toBeTruthy()
        expect(sellerId).toBeNull()
      })
  })

  it('Register valid', () => {
    const reqBody = {
      full_name: "full_name",
      email: "full@example.com",
      phone: "081238192312",
      password: "password",
      confirm_password: "password",
      role: "buyer",
    }
    return request(app.getHttpServer())
      .post('/users')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { full_name, email, phone, id } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(full_name).toEqual(reqBody.full_name)
        expect(email).toEqual(reqBody.email)
        expect(phone).toEqual(reqBody.phone)
        const count = getConnection()
          .getRepository(UserEntity)
          .count({ where: { email: 'full@example.com' } })
        expect(count).resolves.toEqual(1)
      })
  })

  it('Email is not email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: "full_name",
        phone: "081238192312",
        email: "full",
        password: "password",
        confirm_password: "password"
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull())
  })

  it('Phone number invalid', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: "full_name",
        phone: "08123819abc",
        email: "full@example.com",
        password: "password",
        confirm_password: "password"
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull())
  })
})