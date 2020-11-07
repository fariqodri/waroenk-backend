import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorEntity } from '../src/misc/entities/sponsor.entity';
import * as request from 'supertest';
import { getConnection, getRepository } from 'typeorm';
import { FaqEntity } from '../src/misc/entities/faq.entity';
import { LocationEntity } from '../src/misc/entities/location.entity';
import { MiscModule } from '../src/misc/misc.module';
import { entities } from './dependencies';

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
          entities: entities,
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(FaqEntity).insert([
      {
        id: '1',
        title: "cara menanam jagung",
        description: "jagung ditanam lalu dipacul",
        created_at: new Date('123')
      },
      {
        id: '2',
        title: "cara menanam tomat",
        description: "tomat ditanam lalu dipacul",
        created_at: new Date('124')
      },
      {
        id: '3',
        title: "survive in the jungle",
        description: "find some foods",
        created_at: new Date('125')
      },
    ])
    await getRepository(LocationEntity).insert([
      {
        kode: '11',
        nama: 'Aceh'
      },
      {
        kode: '11.11',
        nama: 'Kabupaten Aceh 1'
      },
      {
        kode: '11.11.11',
        nama: 'Kecamatan Aceh 1'
      },
      {
        kode: '11.11.11.1111',
        nama: 'Desa Aceh 1'
      },
      {
        kode: '11.11.11.1112',
        nama: 'Desa Aceh 2'
      },
      {
        kode: '11.11.12',
        nama: 'Kecamatan Aceh 2'
      },
      {
        kode: '11.12',
        nama: 'Kabupaten Aceh 2'
      },
      {
        kode: '12',
        nama: 'Jakarta'
      },
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it(`should list provinces`, () => {
    return request(app.getHttpServer())
      .get('/location?type=province')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Aceh', full_kode: '11' },
          { kode: '12', nama: 'Jakarta', full_kode: '12' }
        ]
      });
  });

  it(`should list provinces with search`, () => {
    return request(app.getHttpServer())
      .get('/location?type=province&search=ac')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Aceh', full_kode: '11' }]
      });
  });

  it(`should list cities`, () => {
    return request(app.getHttpServer())
      .get('/location?type=city&province=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kabupaten Aceh 1', full_kode: '11.11' },
          { kode: '12', nama: 'Kabupaten Aceh 2', full_kode: '11.12' }
        ]
      });
  });

  it(`should list cities with search`, () => {
    return request(app.getHttpServer())
      .get('/location?type=city&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Kabupaten Aceh 1', full_kode: '11.11' }]
      });
  });

  it(`should list districts`, () => {
    return request(app.getHttpServer())
      .get('/location?type=district&province=11&city=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kecamatan Aceh 1', full_kode: '11.11.11' },
          { kode: '12', nama: 'Kecamatan Aceh 2', full_kode: '11.11.12' }
        ]
      });
  });

  it(`should list districts with search`, () => {
    return request(app.getHttpServer())
      .get('/location?type=district&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Kecamatan Aceh 1', full_kode: '11.11.11' }]
      });
  });

  it(`should list sub-districts`, () => {
    return request(app.getHttpServer())
      .get('/location?type=sub-district&province=11&city=11&district=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '1111', nama: 'Desa Aceh 1', full_kode: '11.11.11.1111' },
          { kode: '1112', nama: 'Desa Aceh 2', full_kode: '11.11.11.1112' }
        ]
      });
  });

  it(`should list sub-districts with search`, () => {
    return request(app.getHttpServer())
      .get('/location?type=sub-district&province=11&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '1111', nama: 'Desa Aceh 1', full_kode: '11.11.11.1111' }]
      });
  });

  it(`should list faqs`, () => {
    return request(app.getHttpServer())
      .get('/faq')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: '3',
            title: 'survive in the jungle',
            description: 'find some foods'
          },
          {
            id: '2',
            title: 'cara menanam tomat',
            description: 'tomat ditanam lalu dipacul'
          },
          {
            id: '1',
            title: 'cara menanam jagung',
            description: 'jagung ditanam lalu dipacul'
          }
        ],
        page: 1,
        limit: 3
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
            id: '2',
            title: 'cara menanam tomat',
            description: 'tomat ditanam lalu dipacul'
          },
          {
            id: '1',
            title: 'cara menanam jagung',
            description: 'jagung ditanam lalu dipacul'
          }
        ],
        page: 1,
        limit: 2
      });
  });
  it(`should list sponsors with filter`, async () => {
    const sponsor: SponsorEntity = {
      id: '1',
      image: 'image.com',
      type: 'sponsor',
      deleted_at: null
    }
    await getRepository(SponsorEntity).insert(sponsor);
    return request(app.getHttpServer())
      .get('/sponsors?type=sponsor')
      .expect(200)
      .expect({
        message: 'ok',
        result: [sponsor],
        page: 0,
        limit: 0
      });
  });
});