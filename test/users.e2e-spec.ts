import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../src/constants';

import { UsersModule } from '../src/users/users.module';
import { PermissionService } from '../src/permission/permission.service';
import { PermissionModule } from '../src/permission/permission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection, getRepository } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { RedisModule } from '../src/redis/redis.module';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { entities, fakeJwtAuthGuardFactory, fakeRedisClientProvider } from './dependencies';
import { LocationEntity } from '../src/misc/entities/location.entity';
import { ShippingAddressEntity } from '../src/users/entities/shipping-address.entity';

describe('Users E2E', () => {
  let app: INestApplication;
  let permissionService = {
    addMemberToRole: () => jest.fn(),
  };
  const fakeRedisClientProvider = {
    set: jest
      .fn()
      .mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
    get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
  };
  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' };
      return true;
    }),
  };

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PermissionModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: entities,
        }),
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({}),
      ],
    })
      .overrideProvider(PermissionService)
      .useValue(permissionService)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it('Edit User Profile', async () => {
    const reqBody = {
      full_name: 'fullo',
      email: 'fullo@example.com',
      phone: '081238192322',
      old_password: 'password',
      password: 'password2',
      confirm_password: 'password2',
    };
    getConnection()
      .getRepository(UserEntity)
      .insert({
        id: 'user-1',
        full_name: 'full_name',
        email: 'full@example.com',
        phone: '081238192312',
        password: await bcrypt.hash('password', SALT_ROUNDS),
        role: 'buyer',
      });
    return request(app.getHttpServer())
      .put('/users')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        expect(message).toEqual('profile has been updated');
        expect(result).toBeNull();
      });
  });

  it('Get User Info', () => {
    getConnection()
      .getRepository(UserEntity)
      .insert({
        id: 'user-1',
        full_name: 'full_name',
        email: 'full@example.com',
        phone: '081238192312',
        password: 'password',
        role: 'buyer',
      });
    return (
      request(app.getHttpServer())
        .get('/users')
        // .set('Authorization', 'fake_token')
        .expect(200)
        .then(res => {
          const body = res.body;
          const { message, result } = body;
          const {
            id,
            full_name,
            email,
            phone,
            role,
            created_at,
            is_active,
            sellerId,
          } = result;
          expect(message).toEqual('ok');
          expect(id).toBeDefined();
          expect(full_name).toEqual('full_name');
          expect(email).toEqual('full@example.com');
          expect(phone).toEqual('081238192312');
          expect(role).toEqual('buyer');
          expect(created_at).toBeDefined();
          expect(is_active).toBeTruthy();
          expect(sellerId).toBeNull();
        })
    );
  });

  it('Register valid', () => {
    const reqBody = {
      full_name: 'full_name',
      email: 'full@example.com',
      phone: '081238192312',
      password: 'password',
      confirm_password: 'password',
      role: 'buyer',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { full_name, email, phone, id } = result;
        expect(message).toEqual('ok');
        expect(id).toBeDefined();
        expect(full_name).toEqual(reqBody.full_name);
        expect(email).toEqual(reqBody.email);
        expect(phone).toEqual(reqBody.phone);
        const count = getConnection()
          .getRepository(UserEntity)
          .count({ where: { email: 'full@example.com' } });
        expect(count).resolves.toEqual(1);
      });
  });

  it('Email is not email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: 'full_name',
        phone: '081238192312',
        email: 'full',
        password: 'password',
        confirm_password: 'password',
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull());
  });

  it('Phone number invalid', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: 'full_name',
        phone: '08123819abc',
        email: 'full@example.com',
        password: 'password',
        confirm_password: 'password',
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull());
  });
});

describe("User's Shipping Address", () => {
  let app: INestApplication;
  const fakeJwtAuthGuard = fakeJwtAuthGuardFactory({
    userId: 'user-1',
    issuedAt: 1,
    expiredAt: 2,
    role: 'buyer',
  });
  const user: any = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'buyer',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true,
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: entities,
        }),
        AuthModule,
        RedisModule.register({})
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()
    await getRepository(UserEntity).insert(user)
    await getRepository(LocationEntity).insert([
      {
        kode: '31.11',
        nama: 'Jakarta Selatan'
      },
      {
        kode: '31.11.11',
        nama: 'Tebet'
      },
      {
        kode: '31.11.11.11',
        nama: 'Tebet Timur'
      }
    ])
  });

  afterEach(async () => {
    await getConnection().close()
  })

  it('should create shipping address with full body', async () => {
    const requestBody = {
      receiver_name: 'Fari Qodri',
      receiver_phone: '08129281912',
      street: 'Jalan Baru No. 18 RT 11 RW 8',
      city_code: '31.11',
      kecamatan_code: '31.11.11',
      kelurahan_code: '31.11.11.11',
      post_code: '13520'
    }
    const resp = await request(app.getHttpServer())
      .put('/users/shipping-address')
      .send(requestBody)
      .expect(200)
    const body = resp.body
    const { result } = body
    const { id, receiver_name, receiver_phone, street, city, kecamatan, kelurahan } = result
    expect(id).toBeDefined()
    expect(receiver_name).toEqual(requestBody.receiver_name)
    expect(receiver_phone).toEqual(requestBody.receiver_phone)
    expect(street).toEqual(requestBody.street)
    expect(city).toEqual({
      kode: '31.11',
      nama: 'Jakarta Selatan'
    })
    expect(kecamatan).toEqual({
      kode: '31.11.11',
      nama: 'Tebet'
    })
    expect(kelurahan).toEqual({
      kode: '31.11.11.11',
      nama: 'Tebet Timur'
    })
    const address = await getRepository(ShippingAddressEntity).findOneOrFail(id, { relations: ['city', 'kecamatan', 'kelurahan'] })
    expect(address.receiver_name).toEqual(requestBody.receiver_name)
    expect(address.receiver_phone).toEqual(requestBody.receiver_phone)
    expect(address.street).toEqual(requestBody.street)
    expect(address.city).toEqual({
      kode: '31.11',
      nama: 'Jakarta Selatan'
    })
    expect(address.kecamatan).toEqual({
      kode: '31.11.11',
      nama: 'Tebet'
    })
    expect(address.kelurahan).toEqual({
      kode: '31.11.11.11',
      nama: 'Tebet Timur'
    })
  })

  it('should create shipping address with derived body', async () => {
    const requestBody = {
      street: 'Jalan Baru No. 18 RT 11 RW 8',
      city_code: '31.11',
      kecamatan_code: '31.11.11',
      kelurahan_code: '31.11.11.11',
      post_code: '13520'
    }
    const resp = await request(app.getHttpServer())
      .put('/users/shipping-address')
      .send(requestBody)
      .expect(200)
    const body = resp.body
    const { result } = body
    const { id, receiver_name, receiver_phone, street, city, kecamatan, kelurahan } = result
    expect(id).toBeDefined()
    expect(receiver_name).toEqual(user.full_name)
    expect(receiver_phone).toEqual(user.phone)
    expect(street).toEqual(requestBody.street)
    expect(city).toEqual({
      kode: '31.11',
      nama: 'Jakarta Selatan'
    })
    expect(kecamatan).toEqual({
      kode: '31.11.11',
      nama: 'Tebet'
    })
    expect(kelurahan).toEqual({
      kode: '31.11.11.11',
      nama: 'Tebet Timur'
    })
    const address = await getRepository(ShippingAddressEntity).findOneOrFail(id, { relations: ['city', 'kecamatan', 'kelurahan'] })
    expect(address.receiver_name).toEqual(user.full_name)
    expect(address.receiver_phone).toEqual(user.phone)
    expect(address.street).toEqual(requestBody.street)
    expect(address.city).toEqual({
      kode: '31.11',
      nama: 'Jakarta Selatan'
    })
    expect(address.kecamatan).toEqual({
      kode: '31.11.11',
      nama: 'Tebet'
    })
    expect(address.kelurahan).toEqual({
      kode: '31.11.11.11',
      nama: 'Tebet Timur'
    })
  })
});
