import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { FaqEntity } from '../src/misc/entities/faq.entity';
import { MiscModule } from '../src/misc/misc.module';

describe('GET Product and Categories (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MiscModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            FaqEntity
          ],
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(FaqEntity).insert([
      {
        id: 1,
        title: "cara menanam jagung",
        description: "jagung ditanam lalu dipacul",
        created_at: new Date('123')
      },
      {
        id: 2,
        title: "cara menanam tomat",
        description: "tomat ditanam lalu dipacul",
        created_at: new Date('124')
      },
      {
        id: 3,
        title: "survive in the jungle",
        description: "find some foods",
        created_at: new Date('125')
      },
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it(`should list faqs`, () => {
    return request(app.getHttpServer())
      .get('/faq')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 3,
            title: 'survive in the jungle',
            description: 'find some foods'
          },
          {
            id: 2,
            title: 'cara menanam tomat',
            description: 'tomat ditanam lalu dipacul'
          },
          {
            id: 1,
            title: 'cara menanam jagung',
            description: 'jagung ditanam lalu dipacul'
          }
        ],
        page: 1,
        limit: 10
      });
  });

  it(`should list faqs with filter`, () => {
    return request(app.getHttpServer())
      .get('/faq?search=pacul')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 2,
            title: 'cara menanam tomat',
            description: 'tomat ditanam lalu dipacul'
          },
          {
            id: 1,
            title: 'cara menanam jagung',
            description: 'jagung ditanam lalu dipacul'
          }
        ],
        page: 1,
        limit: 10
      });
  });
});