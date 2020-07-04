import { INestApplication, ExecutionContext } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from 'supertest';

import { ProductsModule } from "../src/products/products.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "../src/products/entities/category.entity";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { ProductEntity } from "../src/products/entities/product.entity";
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { getRepository, getConnection } from "typeorm";
import { ShopModule } from "../src/shop/shop.module";
import { RedisClientProvider } from "../src/redis/redis.client.provider";


const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}

describe('Shop E2E', () => {
  let app: INestApplication;

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'seller' }
      return true
    })
  }
  
  const vegetableCategory = { id: 'category-1', name: 'Sayuran', image: 's3_url_1' };
  const fruitsCategory = { id: 'category-2', name: 'Buah-buahan', image: 's3_url_1' };
  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const seller: SellerAttribute = {
    id: 'seller-1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true
  }
  const user2: UserEntity = {
    id: 'user-2',
    full_name: 'user 2',
    email: 'user2@example.com',
    phone: '0812232112',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const seller2: SellerAttribute = {
    id: 'seller-2',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    user: user2,
    created_at: new Date(),
    updated_at: null,
    is_active: true
  }
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity, UserEntity, SellerAttribute, ProductEntity],
        }),
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({}),
        ShopModule
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()

    await getRepository(UserEntity).insert([user, user2])
    await getRepository(SellerAttribute).insert([seller, seller2])
    await getRepository(CategoryEntity).insert([vegetableCategory, fruitsCategory])
    await getRepository(ProductEntity).insert([
      {
        id: 'product_1',
        name: 'KangKunG',
        price_per_quantity: 10000,
        discount: 0,
        description: 'kangkung',
        images: ['1'],
        category: vegetableCategory,
        seller: seller,
        created_at: '2020-06-30 19:32:30',
        updated_at: null
      },
      {
        id: 'product_2',
        name: 'Jeruk',
        price_per_quantity: 20000,
        discount: 0,
        description: 'jeruk',
        images: ['1'],
        category: fruitsCategory,
        seller: seller,
        created_at: '2020-06-30 18:32:30',
        updated_at: null
      },
      {
        id: 'product_3',
        name: 'Bayam',
        price_per_quantity: 5000,
        discount: 0,
        description: 'bayam',
        images: ['1'],
        category: vegetableCategory,
        seller: seller2,
        created_at: '2020-06-30 18:32:30',
        updated_at: null
      },
    ])
  })
  it('should return newly created product when create product', () => {
    const reqBody = {
      name: "Paprika",
      categoryId: "category-1",
      price_per_quantiy: 10000,
      discount: 0.5,
      description: "Buah atau sayur gatau tp segar",
      images: ["img1.com","img2.com"],
      available: true
    }
    return request(app.getHttpServer())
      .post('/shop/products')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, name, price_per_quantity, discount, description, images, 
          created_at, updated_at, deleted_at, seller, category, available } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(name).toEqual(reqBody.name)
        expect(price_per_quantity).toEqual(reqBody.price_per_quantiy)
        expect(discount).toEqual(reqBody.discount)
        expect(description).toEqual(reqBody.description)
        expect(images).toEqual(reqBody.images)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeNull()
        expect(deleted_at).toBeNull()
        expect(seller.id).toEqual("seller-1")
        expect(category.id).toEqual("category-1")
        expect(available).toEqual(reqBody.available)
      })
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('should delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products')
      .send({
        id: "product_1"
      })
      .expect(200)
      .expect({
        message: 'ok',
        result: "product with id [product_1] deleted"
      })
  })

  it('should return 400 when user is wrong when delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products')
      .send({
        id: "product_3"
      })
      .expect(400)
      .expect({
        message: "user is not authorized to delete product or product doesn't exist with id [product_3]",
        result: null
      })
  })

  it('should return 400 when product does not exist when delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products')
      .send({
        id: "product_xyz"
      })
      .expect(400)
      .expect({
        message: "user is not authorized to delete product or product doesn't exist with id [product_xyz]",
        result: null
      })
  })

  it('should search by name', () => {
    return request(app.getHttpServer())
      .get('/shop/products?search=NgKung')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_1',
            name: 'KangKunG',
            price_per_quantity: 10000,
            discount: 0,
            images: ['1']
          },
        ]
      })
  })

  it('should show all, sorted from latest, then name', () => {
    return request(app.getHttpServer())
      .get('/shop/products')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'product_1',
            name: 'KangKunG',
            price_per_quantity: 10000,
            discount: 0,
            images: ['1'],
          },
          {
            id: 'product_2',
            name: 'Jeruk',
            price_per_quantity: 20000,
            discount: 0,
            images: ['1']
          }
        ]
      })
  })
})

describe('Negative test E2E shop', () => {
  let app: INestApplication

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' }
      return true
    })
  }

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [CategoryEntity, UserEntity, SellerAttribute, ProductEntity],
        }),
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({}),
        ShopModule
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()

    it('should return 403', () => {
      return request(app.getHttpServer())
        .get('/shop/products')
        .expect(403)
    })
  })
})

describe('Create Shop', () => {
  let app: INestApplication;

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'seller' }
      return true
    })
  }

  const user: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProductsModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [UserEntity, SellerAttribute, ProductEntity],
        }),
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({}),
        ShopModule
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()

    await getRepository(UserEntity).insert([user])

  it('should return newly created shop when create shop', () => {
    const reqBody = {
      shop_name: "shoppi",
      shop_address: "jalan anggur",
      birth_date: "25/2/1998",
      birth_place: "Bogor",
      gender: "Trans",
      image: ["img-1.com"],
    }
    return request(app.getHttpServer())
      .post('/shop')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, shop_name, shop_address, birth_date, birth_place, gender, 
          created_at, updated_at, is_active, image, seller } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(shop_name).toEqual(reqBody.shop_name)
        expect(shop_address).toEqual(reqBody.shop_address)
        expect(birth_date).toEqual(reqBody.birth_date)
        expect(birth_place).toEqual(reqBody.birth_place)
        expect(gender).toEqual(reqBody.gender)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeNull()
        expect(is_active).toBeFalsy()
        expect(seller.id).toEqual("seller-1")
        expect(image).toEqual(reqBody.image)
      })
    })
  })
})