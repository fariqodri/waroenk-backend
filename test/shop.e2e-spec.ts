import { ExecutionContext, INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { CategoryEntity } from "../src/products/entities/category.entity";
import { ProductEntity } from "../src/products/entities/product.entity";
import { ProductsModule } from "../src/products/products.module";
import { RedisClientProvider } from "../src/redis/redis.client.provider";
import { RedisModule } from "../src/redis/redis.module";
import { ShopModule } from "../src/shop/shop.module";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { UserEntity } from "../src/users/entities/users.entity";
import { entities } from "./dependencies";
import { OrderEntity } from "../src/order/entities/order.entity";
import { OrderItem } from "../src/order/entities/order-item.entity";
import { SellerBank } from "../src/users/entities/seller-bank.entity";
import { SellerCategory } from "../src/products/entities/seller-category.entity";


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
    description: 'lalala1',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    tier: 1,
    user: user,
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    activation_date: new Date()
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
    description: 'lalala2',
    shop_name: 'Toko Sayur',
    shop_address: 'Jakarta',
    birth_date: '1999-09-21',
    birth_place: 'Jakarta',
    gender: 'Male',
    image: "img-1.com",
    tier: 1,
    user: user2,
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    activation_date: new Date()
  }

  const seller1Category1: SellerCategory = {
    id: 'seller1-category1',
    seller: seller,
    category: vegetableCategory,
    activation_date: new Date(),
    expiry_date: null,
    status: 'paid'
  }
  const seller1Category2: SellerCategory = {
    id: 'seller1-category2',
    seller: seller,
    category: fruitsCategory,
    activation_date: new Date(),
    expiry_date: null,
    status: 'paid'
  }
  const seller2Category1: SellerCategory = {
    id: 'seller2-category1',
    seller: seller2,
    category: vegetableCategory,
    activation_date: new Date(),
    expiry_date: null,
    status: 'paid'
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
          entities: entities,
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
    await getRepository(SellerCategory).insert([seller1Category1, seller1Category2, seller2Category1])
    await getRepository(ProductEntity).insert([
      {
        id: 'product_1',
        name: 'KangKunG',
        price_per_quantity: 10000,
        discount: 0,
        description: 'kangkung',
        images: ['1'],
        category: seller1Category1,
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
        category: seller1Category2,
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
        category: seller2Category1,
        seller: seller2,
        created_at: '2020-06-30 18:32:30',
        updated_at: null
      },
    ])
    const bank1: SellerBank = {
      id: 'bank-1',
      seller: seller,
      bank: 'Bank BCA',
      number: '0123123012',
      owner: 'Bung Tomo',
      is_active: true,
      created_at: new Date(),
      updated_at: null
    }
    const bank2: SellerBank = {
      id: 'bank-2',
      seller: seller,
      bank: 'Bank BNI',
      number: '012333012',
      owner: 'Bung Tomori',
      is_active: true,
      created_at: new Date(),
      updated_at: null
    }
    const bank3: SellerBank = {
      id: 'bank-3',
      seller: seller,
      bank: 'Bank BTPN',
      number: '0123123011',
      owner: 'Bung Tomoyo',
      is_active: false,
      created_at: new Date(),
      updated_at: null
    }
    await getRepository(SellerBank).insert([bank1, bank2, bank3])
  })

  it('should list seller order', async () => {
    const productOrder1: ProductEntity = {
      id: 'product_o1',
      name: 'KangKunG',
      price_per_quantity: 10000,
      discount: 0,
      description: 'kangkung',
      images: ['1'],
      category: seller1Category1,
      seller: seller,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
      available: true,
    }
    const productOrder2: ProductEntity = {
      id: 'product_o2',
      name: 'oyong',
      price_per_quantity: 20000,
      discount: 0,
      description: 'otong',
      images: ['1'],
      category: seller1Category1,
      seller: seller,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
      available: true,
    }
    const order1: OrderEntity = {
      id: 'order1',
      user: user2,
      seller: seller,
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
      product: productOrder1,
      quantity: 2
    }
    const order1Item2: OrderItem = {
      order: order1,
      product: productOrder2,
      quantity: 2
    }
    
    await getRepository(ProductEntity).insert([productOrder1, productOrder2])
    await getRepository(OrderEntity).insert([order1])
    await getRepository(OrderItem).insert([order1Item1, order1Item2])
    return request(app.getHttpServer())
      .get('/shop/order/list?status=on_delivery')
      .expect(200)
      .then(res => {
        const body = res.body;
        const { message, result } = body;
        const { id, buyerId, buyerName, status, totalItem, subTotal} = result[0];
        expect(message).toEqual('ok');
        expect(id).toEqual(order1.id);
        expect(status).toEqual('on_delivery');
        expect(buyerId).toEqual(user2.id);
        expect(buyerName).toEqual(user2.full_name);
        expect(totalItem).toEqual(4);
        expect(subTotal).toEqual(70000);
      });
  })

  it('list eligible category', async () => {
    const resp = await request(app.getHttpServer())
      .get('/shop/category')
      .expect(200)
    const { message, result } = resp.body
    expect(message).toEqual('ok')
    expect(result.length).toEqual(2)
  })

  it('create bank', async () => {
    const body = { 
      bank: 'Bank Bukopin',
      number: '14045',
      owner: 'Pak AMiruddin'
    }
    const resp = await request(app.getHttpServer())
      .post('/shop/bank')
      .send(body)
      .expect(201)
    const { message, result } = resp.body
    expect(message).toEqual('ok')
    expect(result.bank).toEqual(body)
    const banks = await getRepository(SellerBank).count({ is_active: true })
    expect(banks).toEqual(3)
  })

  it('edit bank', async () => {
    const body = { 
      bank: 'KEB HANA',
      number: '12345789',
      owner: 'Pak Aisiteru'
    }
    const resp = await request(app.getHttpServer())
      .put('/shop/bank/bank-2')
      .send(body)
      .expect(201)
    const { message, result } = resp.body
    expect(message).toEqual('bank edited')
    expect(result).toEqual(null)
    const bank = await getRepository(SellerBank).findOne('bank-2')
    expect(bank.bank).toEqual(body.bank)
    expect(bank.number).toEqual(body.number)
    expect(bank.owner).toEqual(body.owner)
  })

  it('delete bank', async () => {
    const resp = await request(app.getHttpServer())
      .delete('/shop/bank/bank-2')
      .expect(200)
    const { message, result } = resp.body
    expect(message).toEqual('bank deleted')
    expect(result).toEqual(null)
    const banks = await getRepository(SellerBank).count({ is_active: true })
    expect(banks).toEqual(1)
  })

  it('list bank', async () => {
    const resp = await request(app.getHttpServer())
      .get('/shop/bank/list/seller-1')
      .expect(200)
    const { message, result } = resp.body
    expect(message).toEqual('ok')
    expect(result.length).toEqual(2)
  })

  it('get bank detail', async () => {
    const resp = await request(app.getHttpServer())
      .get('/shop/bank/bank-2')
      .expect(200)
    const { message, result } = resp.body
    expect(message).toEqual('ok')
    expect(result.id).toEqual('bank-2')
  })

  it('get shop', () => {
    return request(app.getHttpServer())
      .get('/shop/seller-1')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          id: 'seller-1',
          description: 'lalala1',
          shop_name: 'Toko Sayur',
          shop_address: 'Jakarta',
          birth_date: '1999-09-21',
          birth_place: 'Jakarta',
          gender: 'Male',
          image: 'img-1.com',
          tier: 1,
          is_active: true
        }
      })
  })

  it('should return edited shop when edit shop', () => {
    const reqBody = {
      description: 'ccd',
      shop_name: "shoppi",
      shop_address: "jalan anggur",
      birth_date: "25/2/1998",
      birth_place: "Bogor",
      gender: "Trans",
      image: "img-1.com",
    }
    return request(app.getHttpServer())
      .put('/shop')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, shop_name, shop_address, birth_date, birth_place, gender, 
          created_at, updated_at, is_active, image, description } = result
        expect(message).toEqual('ok')
        expect(id).toEqual("seller-1")
        expect(shop_name).toEqual(reqBody.shop_name)
        expect(shop_address).toEqual(reqBody.shop_address)
        expect(birth_date).toEqual(reqBody.birth_date)
        expect(birth_place).toEqual(reqBody.birth_place)
        expect(gender).toEqual(reqBody.gender)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeDefined()
        expect(is_active).toBeTruthy()
        expect(image).toEqual(reqBody.image)
        expect(description).toEqual(reqBody.description)
      })
  })

  it('should return newly created product when create product', () => {
    const reqBody = {
      name: "Paprika",
      categoryId: "category-1",
      price_per_quantity: 10000,
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
        expect(price_per_quantity).toEqual(reqBody.price_per_quantity)
        expect(discount).toEqual(reqBody.discount)
        expect(description).toEqual(reqBody.description)
        expect(images).toEqual(reqBody.images)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeNull()
        expect(deleted_at).toBeNull()
        expect(seller.id).toEqual("seller-1")
        expect(category.id).toEqual('seller1-category1')
        expect(available).toEqual(reqBody.available)
      })
  })

  it('should return edited product when edit product', () => {
    const reqBody = {
      categoryId: vegetableCategory.id,
      name: "Paprika",
      price_per_quantity: 10000,
      discount: 0.5,
      description: "Buah atau sayur gatau tp segar",
      images: ["img1.com","img2.com"],
      available: true
    }
    return request(app.getHttpServer())
      .put('/shop/products/product_1')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, name, price_per_quantity, discount, description, images, 
          created_at, updated_at, category, available } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(name).toEqual(reqBody.name)
        expect(price_per_quantity).toEqual(reqBody.price_per_quantity)
        expect(discount).toEqual(reqBody.discount)
        expect(description).toEqual(reqBody.description)
        expect(images).toEqual(reqBody.images)
        expect(created_at).toBeDefined()
        expect(updated_at).toBeDefined()
        expect(category.id).toEqual('seller1-category1')
        expect(available).toEqual(reqBody.available)
      })
  })

  afterEach(async () => {
    await getConnection().close()
  })

  it('should delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products/product_1')
      .expect(200)
      .expect({
        message: 'ok',
        result: "product with id [product_1] deleted"
      })
  })

  it('should return 400 when user is wrong when delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products/product_3')
      .expect(400)
      .expect({
        message: "user is not authorized to delete product or product doesn't exist with id [product_3]",
        result: null
      })
  })

  it('should return 400 when product does not exist when delete product', () => {
    return request(app.getHttpServer())
      .delete('/shop/products/product_xyz')
      .expect(400)
      .expect({
        message: "user is not authorized to delete product or product doesn't exist with id [product_xyz]",
        result: null
      })
  })

  it('`should search` by name', () => {
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
            images: ['1'],
            available: true,
            category_name: vegetableCategory.name,
            category_id: vegetableCategory.id
          },
        ],
        page: 1,
        limit: 1,
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
            available: true,
            category_name: vegetableCategory.name,
            category_id: vegetableCategory.id
          },
          {
            id: 'product_2',
            name: 'Jeruk',
            price_per_quantity: 20000,
            discount: 0,
            images: ['1'],
            available: true,
            category_name: fruitsCategory.name,
            category_id: fruitsCategory.id
          }
        ],
        page: 1,
        limit: 2,
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
          entities: entities,
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
          entities: entities,
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
      image: "img-1.com",
    }
    return request(app.getHttpServer())
      .post('/shop')
      .send(reqBody)
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, shop_name, shop_address, birth_date, birth_place, gender, 
          created_at, updated_at, is_active, image, seller, tier } = result
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
        expect(tier).toEqual(1)
      })
    })
  })
})