import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { UsersModule } from '../src/users/users.module'
import { PermissionService } from '../src/permission/permission.service';
import { PermissionModule } from '../src/permission/permission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../src/users/entities/users.entity';
import { getConnection } from 'typeorm';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';

describe('Users E2E', () => {
  let app: INestApplication;
  let permissionService = {
    addMemberToRole: () => jest.fn()
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PermissionModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity, UserEntity, SellerAttribute, ProductEntity]
        })
      ]
    })
      .overrideProvider(PermissionService)
      .useValue(permissionService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('Register valid', () => {
    const reqBody = {
      full_name: "full_name",
      email: "full@example.com",
      phone: "081238192312",
      password: "password",
      confirm_password: "password",
      role: "buyer",
    }
    return request(app.getHttpServer())
      .post('/users')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { full_name, email, phone, id } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(full_name).toEqual(reqBody.full_name)
        expect(email).toEqual(reqBody.email)
        expect(phone).toEqual(reqBody.phone)
        const count = getConnection()
          .getRepository(UserEntity)
          .count({ where: { email: 'full@example.com' } })
        expect(count).resolves.toEqual(1)
      })
  })

  it('Email is not email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: "full_name",
        phone: "081238192312",
        email: "full",
        password: "password",
        confirm_password: "password"
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull())
  })

  it('Phone number invalid', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        full_name: "full_name",
        phone: "08123819abc",
        email: "full@example.com",
        password: "password",
        confirm_password: "password"
      })
      .expect(400)
      .then(res => expect(res.body.result).toBeNull())
  })
})