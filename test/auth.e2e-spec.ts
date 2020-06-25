import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';

import { AuthModule } from '../src/auth/auth.module'
import { UsersModule } from '../src/users/users.module';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RedisModule } from '../src/redis/redis.module';
import { RedisService } from '../src/redis/redis.service';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { JwtService } from '@nestjs/jwt';

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
      decode: jest.fn().mockReturnValue({ iat: 1, exp: 2 })
    }
    
    const moduleFixture = await Test.createTestingModule({
      imports: [
        RedisModule.register({}),
        AuthModule,
        UsersModule,
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
  })

  it('should add revoked token to DB', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set("Authorization", "Bearer fake_token")
      .expect(200)
      .expect({
        "message": "ok",
        "result": null
      })
  })
})
