import { INestApplication, ExecutionContext } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from 'supertest';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "../src/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { getRepository, getConnection } from "typeorm";
import { RedisClientProvider } from "../src/redis/redis.client.provider";

import { OrderModule } from "../src/order/order.module";
import { CategoryEntity } from "../src/products/entities/category.entity";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { ProductEntity } from "../src/products/entities/product.entity";
import { AgendaEntity } from "../src/agenda/entities/agenda.entity";
import { OrderEntity } from "../src/order/entities/order.entity";
import { OrderItem } from "../src/order/entities/order-item.entity";
import { CartEntity } from "../src/order/entities/cart.entity";
import { AuthModule } from "../src/auth/auth.module";
import { DiscussionEntity } from "../src/discussion/entities/discussion.entity";
import { ProposalEntity } from "../src/proposal/entities/proposal.entity";
import { ProposalData } from "../src/proposal/entities/proposal-data.entity";


const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}
  
describe('Order e2e test', () => {
  let app: INestApplication

  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' }
      return true
    })
  }

  const vegetableCategory: CategoryEntity = { 
    id: 'category-1', 
    name: 'Sayuran', 
    image: 's3_url_1'
  };
  const user1: UserEntity = {
    id: 'user-1',
    full_name: 'user 1',
    email: 'user@example.com',
    phone: '0812232112',
    role: 'buyer',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const user2: UserEntity = {
    id: 'user-2',
    full_name: 'user 2',
    email: 'use2r@example.com',
    phone: '0812232113',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const user3: UserEntity = {
    id: 'user-3',
    full_name: 'user 3',
    email: 'user3@example.com',
    phone: '0812332112',
    role: 'buyer',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const user4: UserEntity = {
    id: 'user-4',
    full_name: 'user 4',
    email: 'user4@example.com',
    phone: '0812334112',
    role: 'seller',
    password: 'hehe1234',
    created_at: new Date(),
    updated_at: null,
    is_active: true
  };
  const seller1: SellerAttribute = {
    id: 'seller-1',
    description: 'lalala1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: 'img-1.com',
    tier: 1,
    user: user2,
    created_at: new Date(),
    updated_at: null,
    is_active: true
  }
  const seller2: SellerAttribute = {
    id: 'seller-2',
    description: 'lalala2',
    shop_name: 'Toko Buah',
    shop_address: 'Jakarta',
    birth_date: '1999-09-22',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: 'img-2.com',
    tier: 1,
    user: user4,
    created_at: new Date(),
    updated_at: null,
    is_active: true
  }
  const product1: ProductEntity = {
    id: 'product_1',
    name: 'KangKunG',
    price_per_quantity: 10000,
    discount: 0,
    description: 'kangkung',
    images: ['1'],
    category: vegetableCategory,
    seller: seller1,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
    available: true,
  }
  const product2: ProductEntity = {
    id: 'product_2',
    name: 'oyong',
    price_per_quantity: 20000,
    discount: 0,
    description: 'otong',
    images: ['1'],
    category: vegetableCategory,
    seller: seller1,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
    available: true,
  }
  const product3: ProductEntity = {
    id: 'product_3',
    name: 'Bayam',
    price_per_quantity: 5000,
    discount: 0,
    description: 'bayam',
    images: ['1'],
    category: vegetableCategory,
    seller: seller1,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
    available: true,
  }
  const product4: ProductEntity = {
    id: 'product_4',
    name: 'Bayamayam',
    price_per_quantity: 6000,
    discount: 0,
    description: 'bayami',
    images: ['2'],
    category: vegetableCategory,
    seller: seller2,
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
    available: true,
  }
  const cart1: CartEntity = {
    product: product1,
    user: user1,
    quantity: 2,
    is_active: true
  }
  const cart2: CartEntity = {
    product: product2,
    user: user1,
    quantity: 0,
    is_active: false
  }
  const cart3: CartEntity = {
    product: product4,
    user: user1,
    quantity: 3,
    is_active: true
  }
  const cart4: CartEntity = {
    product: product1,
    user: user3,
    quantity: 0,
    is_active: false
  }
  const cart5: CartEntity = {
    product: product2,
    user: user3,
    quantity: 0,
    is_active: false
  }
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        OrderModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [
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
        AuthModule,
        RedisModule.register({}),
        JwtModule.register({})
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()

    await getRepository(UserEntity).insert([user1, user2, user3, user4])
    await getRepository(SellerAttribute).insert([seller1, seller2])
    await getRepository(CategoryEntity).insert([vegetableCategory])
    await getRepository(ProductEntity).insert([product1, product2, product3, product4])
    await getRepository(CartEntity).insert([cart1, cart2, cart3, cart4, cart5])
  })

  afterEach(async () => {
    await getConnection().close();
  });

  it('should create new order', () => {
    const reqBody = {
      address: 'jalan tendean'
    }
    return request(app.getHttpServer())
      .post('/order')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result).toHaveLength(2);
      });
  })

  it('should return list of cart', () => {
    return request(app.getHttpServer())
      .get('/cart')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            quantity: 2,
            product_id: 'product_1',
            product_name: 'KangKunG',
            price_per_quantity: 10000,
            discount: 0,
            images: '1'
          },
          {
            quantity: 3,
            product_id: 'product_4',
            product_name: 'Bayamayam',
            price_per_quantity: 6000,
            discount: 0,
            images: '2'
          }
        ],
        page: 1,
        limit: 2,
      });
  })

  it('should save new cart', () => {
    const reqBody = {
      productId: 'product_3',
      quantity: 1
    }
    return request(app.getHttpServer())
      .post('/cart')
      .send(reqBody)
      .expect(201)
      .expect({
        message: 'ok',
        result: 'new cart item successfully created'
      });
  })

  it('should save edit cart', () => {
    const reqBody = {
      productId: 'product_1',
      quantity: 0
    }
    return request(app.getHttpServer())
      .post('/cart')
      .send(reqBody)
      .expect(201)
      .expect({
        message: 'ok',
        result: 'cart item successfully edited'
      });
  })
})