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
            CartEntity
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

  // it(`should parse user and insert it`, () => {
  //   return request(app.getHttpServer())
  //     .post('/bulk-upload/user')
  //     .set('Content-Type', 'multipart/form-data')
  //     .attach('file', '../Downloads/user_list.csv')
  //     .expect(201)
  //     .expect({
  //       message: 'ok',
  //       result: [
  //         {
  //           full_name: 'Amiruddin',
  //           email: 'waroeng.umkm@gmail.com',
  //           phone: '00111232132'
  //         },
  //         { full_name: 'zzzz', email: 'nuril98@gmail.com', phone: '0000' }
  //       ]
  //     });
  // });

  // it('should parse seller and insert it', async () => {
  //   getConnection()
  //     .getRepository(UserEntity)
  //     .insert([{
  //       id: 'user-1',
  //       full_name: "Amiruddin",
  //       email: "waroeng.umkm@gmail.com",
  //       phone: "081238192312",
  //       password: 'password',
  //       role: 'seller'
  //     },
  //     {
  //       id: 'user-2',
  //       full_name: "zzzz",
  //       email: "nuril98@gmail.com",
  //       phone: "0000",
  //       password: 'password',
  //       role: 'seller'
  //     }])
  //     return request(app.getHttpServer())
  //         .post('/bulk-upload/seller')
  //         .set('Content-Type', 'multipart/form-data')
  //         .attach('file', '../Downloads/shop_list.csv')
  //         .expect(201)
  //         .expect({
  //           message: 'ok',
  //           result: [
  //             {
  //               email: 'waroeng.umkm@gmail.com',
  //               shop_name: 'toko jaya raya',
  //               shop_address: 'Makasar',
  //               description: 'toko yang menjual perabotan dan mainan anak',
  //               birth_date: '19/12/2018',
  //               birth_place: 'Jakarta',
  //               gender: 'Perempuan',
  //               image: 'https://www.kindpng.com/picc/b/24/248253.png'
  //             },
  //             {
  //               email: 'nuril98@gmail.com',
  //               shop_name: 'Toko cihuy',
  //               shop_address: 'Jatinegara',
  //               description: 'toko menjual barang2 cihuy',
  //               birth_date: '18/12/2008',
  //               birth_place: 'Jakarta',
  //               gender: 'Perempuan',
  //               image: 'https://www.kindpng.com/picc/b/24/248253.png'
  //             }
  //           ]
  //         });
  // })

  // it(`should parse product and insert it`, () => {
  //   getConnection()
  //     .getRepository(UserEntity)
  //     .insert([{
  //       id: 'user-1',
  //       full_name: "Amiruddin",
  //       email: "waroeng.umkm@gmail.com",
  //       phone: "081238192312",
  //       password: 'password',
  //       role: 'seller'
  //     },
  //     {
  //       id: 'user-2',
  //       full_name: "zzzz",
  //       email: "nuril98@gmail.com",
  //       phone: "0000",
  //       password: 'password',
  //       role: 'seller'
  //     }])
  //   getConnection()
  //     .getRepository(SellerAttribute)
  //     .insert([{
  //       id: 'seller-1',
  //       user: {
  //         id: 'user-1',
  //         full_name: "Amiruddin",
  //         email: "waroeng.umkm@gmail.com",
  //         phone: "081238192312",
  //         password: 'password',
  //         role: 'seller'
  //       },
  //       tier: 1,
  //       description: 'wawawawa',
  //       shop_name: 'awawawa',
  //       shop_address: 'awawaw',
  //       birth_date: '01/02/1999',
  //       birth_place: 'dantooine',
  //       gender: 'lucky laki',
  //       image: 'img-1.com'
  //     },
  //     {
  //       id: 'seller-2',
  //       user: {
  //         id: 'user-2',
  //         full_name: "zzzz",
  //         email: "nuril98@gmail.com",
  //         phone: "0000",
  //         password: 'password',
  //         role: 'seller'
  //       },
  //       tier: 1,
  //       description: 'wawawawa',
  //       shop_name: 'awawawa',
  //       shop_address: 'awawaw',
  //       birth_date: '01/02/1999',
  //       birth_place: 'dantooine',
  //       gender: 'lucky laki',
  //       image: 'img-2.com'
  //     }])
  //     getConnection()
  //     .getRepository(CategoryEntity)
  //     .insert([{
  //       id: "category-2",
  //       name: "Minuman",
  //       image: "minuman.jpg"
  //     },{
  //       id: "category-4",
  //       name: "Pakaian",
  //       image: "no_image"
  //     }])
  //   return request(app.getHttpServer())
  //     .post('/bulk-upload/product')
  //     .set('Content-Type', 'multipart/form-data')
  //     .attach('file', '../Downloads/product_list.csv')
  //     .expect(201)
  //     .expect({
  //       message: 'ok',
  //       result: [
  //         {
  //           email: 'waroeng.umkm@gmail.com',
  //           product_name: 'Peyek Teri',
  //           product_images: 'https://www.noupe.com/wp-content/uploads/2016/09/basketball_shot-666x418.jpg, https://www.noupe.com/wp-content/uploads/2016/09/basketball_shot-666x418.jpg',
  //           product_price: '15000',
  //           category: 'category-4',
  //           product_description: 'testing only'
  //         },
  //         {
  //           email: 'nuril98@gmail.com',
  //           product_name: 'pakaian',
  //           product_images: 'https://www.noupe.com/wp-content/uploads/2016/09/basketball_shot-666x418.jpg',
  //           product_price: '899999',
  //           category: 'category-2',
  //           product_description: 'asiiik'
  //         },
  //         {
  //           email: 'waroeng.umkm@gmail.com',
  //           product_name: 'Peyek udang',
  //           product_images: 'https://www.noupe.com/wp-content/uploads/2016/09/basketball_shot-666x418.jpg',
  //           product_price: '16000',
  //           category: 'category-4',
  //           product_description: 'testing only2'
  //         }
  //       ]  
  //     });
  // });

  it(`should list provinces`, () => {
    return request(app.getHttpServer())
      .get('/location?type=province')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Aceh' },
          { kode: '12', nama: 'Jakarta' }
        ]
      });
  });

  it(`should list cities`, () => {
    return request(app.getHttpServer())
      .get('/location?type=city&province=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kabupaten Aceh 1' },
          { kode: '12', nama: 'Kabupaten Aceh 2' }
        ]
      });
  });

  it(`should list districts`, () => {
    return request(app.getHttpServer())
      .get('/location?type=district&province=11&city=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '11', nama: 'Kecamatan Aceh 1' },
          { kode: '12', nama: 'Kecamatan Aceh 2' }
        ]
      });
  });

  it(`should list sub-districts`, () => {
    return request(app.getHttpServer())
      .get('/location?type=sub-district&province=11&city=11&district=11')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { kode: '1111', nama: 'Desa Aceh 1' },
          { kode: '1112', nama: 'Desa Aceh 2' }
        ]
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