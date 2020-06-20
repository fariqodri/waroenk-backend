import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProductsModule } from '../src/products/products.module';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ProductsModule],
    }).compile();
    app = moduleFixture.createNestApplication()
    await app.init()
  });

  it(`/GET categories`, () => {
    return request(app.getHttpServer())
      .get("/categories")
      .expect(200)
      .expect({
        "message": "ok",
        "result": [
          {
            id: 'category_1',
            name: 'Sayuran',
            image: 's3_url_1',
          },
          {
            id: 'category_2',
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
            id: 'category_1',
            name: 'Sayuran',
            image: 's3_url_1',
          },
        ]
      })
  })
});
