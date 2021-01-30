import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";
import { SellerTermsConditionsEntity } from "../src/misc/entities/terms-conditions.entity";
import { getConnection, getRepository } from "typeorm";
import { FileUploadModule } from "../src/file.upload/file.upload.module";
import { MiscModule } from "../src/misc/misc.module";
import { entities, fakeJwtAuthGuardFactory, fakeRedisClientProvider } from "./dependencies";
import * as request from 'supertest';
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RedisClientProvider } from "../src/redis/redis.client.provider";

const fakeJwtAuthGuard = fakeJwtAuthGuardFactory({ userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'admin' })

describe('GET Product and Categories (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        FileUploadModule,
        MiscModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: entities,
        }),
        LoggerModule.forRoot(),
        AuthModule,
        RedisModule.register({}),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(SellerTermsConditionsEntity).insert([
      {
        version: 1,
        file: 'file-1'
      },
      {
        version: 2,
        file: 'file-2'
      }
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });

    it('should get latest terms and conditions', () => {
    return request(app.getHttpServer())
      .get('/seller-terms-conditions/latest')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          version: 2,
          file: 'file-2'
        }
      })
  })

  it('should get list of terms and conditions', () => {
    return request(app.getHttpServer())
    .get('/seller-terms-conditions')
    .expect(200)
    .expect({
      message: 'ok',
      result: [
        {
          version: 2,
          file: 'file-2'
        },
        {
          version: 1,
          file: 'file-1'
        }
      ]
    })
  })

  it('should get terms and conditions by version', () => {
    return request(app.getHttpServer())
      .get('/seller-terms-conditions/1')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          version: 1,
          file: 'file-1'
        }
      })
  })
  
});
// describe('Terms and Conditions E2E Test', () => {
//   let app: INestApplication

//   beforeEach(async () => {
//     const moduleFixture = await Test.createTestingModule({
//       imports: [
//         FileUploadModule,
//         MiscModule,
//         TypeOrmModule.forRoot({
//           type: 'sqlite',
//           database: ':memory:',
//           dropSchema: true,
//           synchronize: true,
//           entities: entities,
//         }),
//         LoggerModule.forRoot(),
//         AuthModule,
//         RedisModule.register({}),
//       ],
//     })
//       .overrideGuard(JwtAuthGuard)
//       .useValue(fakeJwtAuthGuard)
//       .overrideProvider(RedisClientProvider)
//       .useValue(fakeRedisClientProvider)
//       .compile();
//     app = moduleFixture.createNestApplication();
//     await app.init();
//     await getRepository(SellerTermsConditionsEntity).insert([
//       {
//         version: 1,
//         file: 'file-1'
//       },
//       {
//         version: 2,
//         file: 'file-2'
//       }
//     ])
//   })

//   afterEach(async () => {
//     await getConnection().close();
//   });

//   it('should get latest terms and conditions', () => {
//     return request(app.getHttpServer())
//       .get('seller-terms-conditions/latest')
//       .expect(200)
//       .expect({
//         message: 'ok',
//         result: {
//           version: 2,
//           file: 'file-2'
//         }
//       })
//   })

//   it('should get list of terms and conditions', () => {
//     return request(app.getHttpServer())
//     .get('seller-terms-conditions')
//     .expect(200)
//     .expect({
//       message: 'ok',
//       result: [
//         {
//           version: 2,
//           file: 'file-2'
//         },
//         {
//           version: 1,
//           file: 'file-1'
//         }
//       ]
//     })
//   })

//   it('should get terms and conditions by version', () => {
//     return request(app.getHttpServer())
//       .get('seller-terms-conditions/1')
//       .expect(200)
//       .expect({
//         message: 'ok',
//         result: {
//           version: 1,
//           file: 'file-1'
//         }
//       })
//   })
// })