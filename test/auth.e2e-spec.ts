import { ExecutionContext, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { RedisModule } from '../src/redis/redis.module';
import { UserEntity } from '../src/users/entities/users.entity';
import { UsersModule } from '../src/users/users.module';
import { entities } from './dependencies';


describe('Login and Logout E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const fakeJwtAuthGuard = {
      canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' }
        return true
      })
    }
    const fakeRedisClientProvider = {
      set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
      get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
    }
    const fakeJwtService = {
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
          entities: entities
        })
      ],
    })
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
        phone: '0821321321',
        is_active: true
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
        message: 'invalid email or password',
        result: null
      })
  })
})
