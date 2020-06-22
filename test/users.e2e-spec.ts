import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { UsersModule } from '../src/users/users.module'
import { PermissionService } from '../src/permission/permission.service';
import { PermissionModule } from '../src/permission/permission.module';

describe('Users E2E', () => {
  let app: INestApplication;
  let permissionService = {
    addMemberToRole: () => jest.fn()
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        UsersModule,
        PermissionModule
      ]
    })
      .overrideProvider(PermissionService)
      .useValue(permissionService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('Register valid', () => {
    const reqBody = {
      full_name: "full_name",
      email: "full@example.com",
      phone: "081238192312",
      password: "password",
      confirm_password: "password"
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