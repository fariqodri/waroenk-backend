import { ExecutionContext, INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { CartEntity } from "../src/order/entities/cart.entity";
import { OrderItem } from "../src/order/entities/order-item.entity";
import { OrderEntity } from "../src/order/entities/order.entity";
import { OrderModule } from "../src/order/order.module";
import { CategoryEntity } from "../src/products/entities/category.entity";
import { ProductEntity } from "../src/products/entities/product.entity";
import { RedisClientProvider } from "../src/redis/redis.client.provider";
import { RedisModule } from "../src/redis/redis.module";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { UserEntity } from "../src/users/entities/users.entity";
import { entities } from "./dependencies";

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
    is_active: true,
    has_paid: true
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
    is_active: true,
    has_paid: true
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
  const newOrder: OrderEntity = {
    id: 'neworder',
    user: user3,
    seller: seller1,
    status: 'new',
    address: 'jalan anggur',
    recipient_name: 'joni',
    recipient_number: '08589239129',
    created_at: new Date(),
    fare: 0,
    courier: null,
    notes: null,
    payment_bank: null,
    account_owner: null,
    account_number: null,
    payment_proof: null,
    receipt_number: null,
    updated_at: null,
    items: []
  }
  const waitingPaymentOrder: OrderEntity = {
    id: 'waitingpaymentorder',
    user: user3,
    seller: seller1,
    status: 'waiting_for_payment',
    address: 'jalan anggur',
    recipient_name: 'joni',
    recipient_number: '08589239129',
    created_at: new Date(),
    fare: 10000,
    courier: 'jne reg',
    notes: 'ke gang delima',
    payment_bank: null,
    account_owner: null,
    account_number: null,
    payment_proof: null,
    receipt_number: null,
    updated_at: new Date(),
    items: []
  }
  const processedOrder: OrderEntity = {
    id: 'processedorder',
    user: user3,
    seller: seller1,
    status: 'processed',
    address: 'jalan anggur',
    recipient_name: 'joni',
    recipient_number: '08589239129',
    created_at: new Date(),
    fare: 10000,
    courier: 'jne reg',
    notes: 'ke gang delima',
    payment_bank: 'bca',
    account_owner: 'joni',
    account_number: '0125212',
    payment_proof: 'img-proof',
    receipt_number: null,
    updated_at: new Date(),
    items: []
  }
  const orderItem1: OrderItem = {
    order: processedOrder,
    product: product1,
    quantity: 2
  }
  const orderItem2: OrderItem = {
    order: processedOrder,
    product: product2,
    quantity: 2
  }
  const onDeliveryOrder: OrderEntity = {
    id: 'ondeliveryorder',
    user: user3,
    seller: seller1,
    status: 'on_delivery',
    address: 'jalan anggur',
    recipient_name: 'joni',
    recipient_number: '08589239129',
    created_at: new Date(),
    fare: 10000,
    courier: 'jne reg',
    notes: 'ke gang delima',
    payment_bank: 'bca',
    account_owner: 'joni',
    account_number: '0125212',
    payment_proof: 'img-proof',
    receipt_number: 'faktur-123121',
    updated_at: new Date(),
    items: []
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
          entities: entities,
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
    await getRepository(OrderEntity).insert([newOrder, waitingPaymentOrder, processedOrder, onDeliveryOrder])
    await getRepository(OrderItem).insert([orderItem1, orderItem2])
  })

  afterEach(async () => {
    await getConnection().close();
  });

  it('should update order to waiting for payment', () => {
    const reqBody = {
      fare: 5000,
      courier: 'jne reg',
      notes: 'swiper jangan mencuri'
    }
    return request(app.getHttpServer())
      .put('/order/neworder')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, fare, courier, notes, status, updated_at} = result;
        expect(message).toEqual('order successfully updated');
        expect(id).toEqual(newOrder.id);
        expect(fare).toEqual(reqBody.fare);
        expect(courier).toEqual(reqBody.courier);
        expect(notes).toEqual(reqBody.notes);
        expect(status).toEqual('waiting_for_payment');
        expect(updated_at).toBeDefined();
      });
  })

  it('should update order to on delivery', () => {
    const reqBody = {
      receipt_number: '01212312931'
    }
    return request(app.getHttpServer())
      .put('/order/processedorder')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, receipt_number, status, updated_at} = result;
        expect(message).toEqual('order successfully updated');
        expect(id).toEqual(processedOrder.id);
        expect(receipt_number).toEqual(reqBody.receipt_number);
        expect(status).toEqual('on_delivery');
        expect(updated_at).toBeDefined();
      });
  })

  it('should update order to processed', () => {
    const reqBody = {
      payment_proof: 'buktinyata.com',
      payment_bank: 'bna',
      account_number: '12031203',
      account_owner: 'koni'
    }
    return request(app.getHttpServer())
      .put('/order/waitingpaymentorder')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, payment_proof, payment_bank, account_number,
          account_owner, status, updated_at} = result;
        expect(message).toEqual('order successfully updated');
        expect(id).toEqual(waitingPaymentOrder.id);
        expect(payment_proof).toEqual(reqBody.payment_proof);
        expect(payment_bank).toEqual(reqBody.payment_bank);
        expect(account_number).toEqual(reqBody.account_number);
        expect(account_owner).toEqual(reqBody.account_owner);
        expect(status).toEqual('processed');
        expect(updated_at).toBeDefined();
      });
  })

  it('should get order detail', () => {
    return request(app.getHttpServer())
      .get('/order/processedorder')
      .expect(200)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, userId, sellerId, items, status, address, recipient_name,
          recipient_number, created_at, fare, courier, notes, payment_bank,
          account_owner, account_number, payment_proof, receipt_number, 
          updated_at, subtotal} = result;
        expect(message).toEqual('ok');
        expect(id).toEqual(processedOrder.id);
        expect(userId).toEqual(processedOrder.user.id);
        expect(sellerId).toEqual(processedOrder.seller.id);
        expect(items).toHaveLength(2);
        expect(status).toEqual(processedOrder.status);
        expect(address).toEqual(processedOrder.address);
        expect(recipient_name).toEqual(processedOrder.recipient_name);
        expect(recipient_number).toEqual(processedOrder.recipient_number);
        expect(created_at).toBeDefined();
        expect(fare).toEqual(processedOrder.fare);
        expect(courier).toEqual(processedOrder.courier);
        expect(notes).toEqual(processedOrder.notes);
        expect(payment_bank).toEqual(processedOrder.payment_bank);
        expect(account_owner).toEqual(processedOrder.account_owner);
        expect(account_number).toEqual(processedOrder.account_number);
        expect(payment_proof).toEqual(processedOrder.payment_proof);
        expect(receipt_number).toEqual(processedOrder.receipt_number);
        expect(updated_at).toBeDefined();
        expect(subtotal).toEqual(70000);
      });
  })

  it('should list order', async () => {
    const order1: OrderEntity = {
      id: 'order1',
      user: user1,
      seller: seller1,
      status: 'on_delivery',
      address: 'jalan anggur',
      recipient_name: 'joni',
      recipient_number: '08589239129',
      created_at: new Date(),
      fare: 10000,
      courier: 'jne reg',
      notes: 'ke gang delima',
      payment_bank: 'bca',
      account_owner: 'joni',
      account_number: '0125212',
      payment_proof: 'img-proof',
      receipt_number: 'faktur-123121',
      updated_at: new Date(),
      items: []
    }
    const order1Item1: OrderItem = {
      order: order1,
      product: product1,
      quantity: 2
    }
    const order1Item2: OrderItem = {
      order: order1,
      product: product2,
      quantity: 2
    }
    await getRepository(OrderEntity).insert([order1])
    await getRepository(OrderItem).insert([order1Item1, order1Item2])
    return request(app.getHttpServer())
      .get('/order?status=on_delivery')
      .expect(200)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, sellerId, sellerName, status, totalItem, subTotal} = result[0];
        expect(message).toEqual('ok');
        expect(id).toEqual(order1.id);
        expect(status).toEqual('on_delivery');
        expect(sellerId).toEqual(seller1.id);
        expect(sellerName).toEqual(seller1.shop_name);
        expect(totalItem).toEqual(4);
        expect(subTotal).toEqual(70000);
      });
  })

  it('should delete order', () => {
    return request(app.getHttpServer())
      .delete('/order/neworder')
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result).toEqual('order successfully canceled');
      });
  })

  it('should finish order', () => {
    return request(app.getHttpServer())
      .put('/order/finish/ondeliveryorder')
      .expect(201)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        expect(message).toEqual('ok');
        expect(result).toEqual('order successfully finished');
      });
  })

  it('should create new order', () => {
    const reqBody = {
      address: 'jalan tendean',
      recipient_name: 'jojon',
      recipient_number: '0217823839'
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
            seller: { sellerId: 'seller-1', sellerName: 'Toko Sayur' },
            products: [{
              quantity: 2,
              discount: 0,
              product_id: 'product_1',
              product_name: 'KangKunG',
              price_per_quantity: 10000,
              images: [ '1' ]
            }]
          },
          {
            seller: { sellerId: 'seller-2', sellerName: 'Toko Buah' },
            products: [{
              quantity: 3,
              discount: 0,
              product_id: 'product_4',
              product_name: 'Bayamayam',
              price_per_quantity: 6000,
              images: [ '2' ]
            }]
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