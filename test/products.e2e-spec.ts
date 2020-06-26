import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../src/products/products.module';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection } from 'typeorm';
import { nanoid } from 'nanoid'

describe('GET CategoriesController (e2e)', () => {
  let app: INestApplication;
  const id_1 = nanoid(11),
        id_2 = nanoid(11)

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity]
        })
      ],
    }).compile();
    app = moduleFixture.createNestApplication()
    await app.init()

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(CategoryEntity)
      .values([
        { id: id_1, name: "Sayuran", image: "s3_url_1" },
        { id: id_2, name: "Buah-buahan", image: "s3_url_1" },
      ])
      .execute()
  });

  afterEach(() => {
    return getConnection().close()
  })
  
  it(`/GET categories`, () => {
    return request(app.getHttpServer())
      .get("/categories")
      .expect(200)
      .expect({
        "message": "ok",
        "result": [
          {
            id: id_1,
            name: 'Sayuran',
            image: 's3_url_1',
          },
          {
            id: id_2,
            name: 'Buah-buahan',
            image: 's3_url_1',
          },
        ]
      })
  })

  it(`/GET categories?sayuran`, () => {
    return request(app.getHttpServer())
      .get("/categories?search=sayuran")
      .expect(200)
      .expect({
        "message": "ok",
        "result": [
          {
            id: id_1,
            name: 'Sayuran',
            image: 's3_url_1',
          },
        ]
      })
  })
});

describe('GET ProductsController (e2e)', () => {
  let app: INestApplication;
  const id_1 = nanoid(11),
        id_2 = nanoid(11),
        id_3 = nanoid(11),
        id_4 = nanoid(11),
        id_5 = nanoid(11)

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity, ProductEntity, UserEntity]
        })
      ],
    }).compile();
    app = moduleFixture.createNestApplication()
    await app.init()

    

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(ProductEntity)
      .values([
        { id: id_4, name: "Vaseline", images: ["s3_url_1"], price_per_quantity: 1000, discount: 0, description: "aaa"},
        { id: id_5, name: "Fiesta Chickennugget", images: ["s3_url_1"], price_per_quantity: 1000, discount: 0, description: "aaa" },
      ])
      .execute()
  });

  afterEach(() => {
    return getConnection().close()
  })
  
  it(`/GET products?page=1&limit=1`, () => {
    return request(app.getHttpServer())
      .get("/categories")
      .expect(200)
      .expect({
        "message": "ok",
        "result": [
          {
            id: id_1,
            name: 'Sayuran',
            image: 's3_url_1',
          }
        ]
      })
  })
});
