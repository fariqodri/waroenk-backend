import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { FaqEntity } from '../src/misc/entities/faq.entity';
import { MiscModule } from '../src/misc/misc.module';
import { LocationEntity } from '../src/misc/entities/location.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { AgendaEntity } from '../src/agenda/entities/agenda.entity';
import { ProposalEntity } from '../src/proposal/entities/proposal.entity';
import { ProposalData } from '../src/proposal/entities/proposal-data.entity';
import { OrderEntity } from '../src/order/entities/order.entity';
import { OrderItem } from '../src/order/entities/order-item.entity';
import { CartEntity } from '../src/order/entities/cart.entity';
import { ChatEntity } from '../src/chat/entities/chat.entity';
import { ChatRoomEntity } from '../src/chat/entities/chat-room.entity';

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
            FaqEntity,
            LocationEntity,
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
            CartEntity,
            ChatEntity,
            ChatRoomEntity
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

  it(`should list provinces mode kode`, () => {
    return request(app.getHttpServer())
      .get('/location?type=province&mode=kode')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Aceh' },
          { kode: '12', nama: 'Jakarta' }
        ]
      });
  });

  it(`should list provinces mode nama`, () => {
    return request(app.getHttpServer())
      .get('/location?type=province&mode=nama&search=ac')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Aceh' }]
      });
  });

  it(`should list cities mode kode`, () => {
    return request(app.getHttpServer())
      .get('/location?type=city&mode=kode&province=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kabupaten Aceh 1' },
          { kode: '12', nama: 'Kabupaten Aceh 2' }
        ]
      });
  });

  it(`should list cities mode nama`, () => {
    return request(app.getHttpServer())
      .get('/location?type=city&mode=nama&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Kabupaten Aceh 1' }]
      });
  });

  it(`should list districts mode kode`, () => {
    return request(app.getHttpServer())
      .get('/location?type=district&mode=kode&province=11&city=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kecamatan Aceh 1' },
          { kode: '12', nama: 'Kecamatan Aceh 2' }
        ]
      });
  });

  it(`should list districts mode nama`, () => {
    return request(app.getHttpServer())
      .get('/location?type=district&mode=nama&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '11', nama: 'Kecamatan Aceh 1' }]
      });
  });

  it(`should list sub-districts mode kode`, () => {
    return request(app.getHttpServer())
      .get('/location?type=sub-district&mode=kode&province=11&city=11&district=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '1111', nama: 'Desa Aceh 1' },
          { kode: '1112', nama: 'Desa Aceh 2' }
        ]
      });
  });

  it(`should list sub-districts mode nama`, () => {
    return request(app.getHttpServer())
      .get('/location?type=sub-district&mode=nama&search=1')
      .expect(200)
      .expect({
        message: 'ok',
        result: [{ kode: '1111', nama: 'Desa Aceh 1' }]
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
        limit: 2
      });
  });
});