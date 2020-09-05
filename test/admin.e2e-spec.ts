import { INestApplication } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from 'supertest';
import { getConnection, getRepository, Between } from "typeorm";
import { AdminModule } from "../src/admin/admin.module";
import { entities, fakeRedisClientProvider, fakeJwtAuthGuardFactory } from "./dependencies";
import { AuthModule } from "../src/auth/auth.module";
import { RedisModule } from "../src/redis/redis.module";
import { UserEntity } from "../src/users/entities/users.entity";
import { SellerAttribute } from "../src/users/entities/seller.entity";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RedisClientProvider } from "../src/redis/redis.client.provider";
import { OrderEntity } from "../src/order/entities/order.entity";
import { ProposalEntity } from "../src/proposal/entities/proposal.entity";
import { CategoryEntity } from "../src/products/entities/category.entity";
import { ProductEntity } from "../src/products/entities/product.entity";
import { DiscussionEntity } from "../src/discussion/entities/discussion.entity";
import { AgendaEntity } from "../src/agenda/entities/agenda.entity";
import { SellerCategory } from "../src/products/entities/seller-category.entity";

describe('Admin e2e', () => {
    let app: INestApplication;

    const admin: UserEntity = {
      id: 'admin-1',
      full_name: 'admin 1',
      email: 'admin@example.com',
      phone: '0814232112',
      role: 'admin',
      password: 'hehe1234',
      created_at: new Date(),
      updated_at: null,
      is_active: true
    }
    const user1: UserEntity = {
      id: 'user-1',
      full_name: 'user 1',
      email: 'user@example.com',
      phone: '0812232112',
      role: 'buyer',
      password: 'hehe1234',
      created_at: new Date(2021, 9),
      updated_at: null,
      is_active: true
    }
    const user2: UserEntity = {
      id: 'user-2',
      full_name: 'user 2',
      email: 'user_2@example.com',
      phone: '0812232112',
      role: 'buyer',
      password: 'hehe1234',
      created_at: new Date(2020, 9),
      updated_at: null,
      is_active: true
    }
    const user3: UserEntity = {
      id: 'user-3',
      full_name: 'user 3',
      email: 'user_3@example.com',
      phone: '0812232112',
      role: 'buyer',
      password: 'hehe1234',
      created_at: new Date(2019, 9),
      updated_at: null,
      is_active: false
    }
    const user4: UserEntity = {
      id: 'user-4',
      full_name: 'user 4',
      email: 'user_4@example.com',
      phone: '08122342112',
      role: 'seller',
      password: 'hehe1234',
      created_at: new Date(2019, 8),
      updated_at: null,
      is_active: true
    }
    const sellerNotActivated: SellerAttribute = {
      id: 'seller-1',
      description: 'lalala1',
      shop_name: 'Toko Sayur a',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user1,
      created_at: new Date(2019, 12),
      updated_at: null,
      is_active: false,
      activation_date: null
    }
    const seller2: SellerAttribute = {
      id: 'seller-2',
      description: 'lalala2',
      shop_name: 'Toko Sayur b',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user2,
      created_at: new Date(2020, 1),
      updated_at: null,
      is_active: true,
      activation_date: new Date()
    }
    const seller3: SellerAttribute = {
      id: 'seller-3',
      description: 'lalala3',
      shop_name: 'Toko Sayur c',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 1,
      user: user3,
      created_at: new Date(2020, 2),
      updated_at: null,
      is_active: true,
      activation_date: new Date()
    }
    const seller4: SellerAttribute = {
      id: 'seller-4',
      description: 'lalala4',
      shop_name: 'Toko Sayur d',
      shop_address: 'Jakarta',
      birth_date: '1999-09-21',
      birth_place: 'Jakarta',
      gender: 'Male',
      image: "img-1.com",
      tier: 2,
      user: user4,
      created_at: new Date(2020, 3),
      updated_at: null,
      is_active: false,
      activation_date: new Date()
    }
    const buyers: UserEntity[] = [
      user1,
      user2,
      user3
    ]
    const order1: OrderEntity = {
      id: 'order-1',
      user: user4,
      seller: seller2,
      status: 'new',
      address: 'jalan anggur',
      recipient_name: 'joni',
      recipient_number: '08589239129',
      created_at: new Date(2020, 4, 1, 12),
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
    const order2: OrderEntity = {
      id: 'order-2',
      user: user4,
      seller: seller2,
      status: 'new',
      address: 'jalan anggur',
      recipient_name: 'joni',
      recipient_number: '08589239129',
      created_at: new Date(2020, 4, 2, 12),
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
    const vegetableCategory = {
      id: 'category-1',
      name: 'Sayuran',
      image: 's3_url_1',
    }
    const fruitCategory = {
      id: 'category-2',
      name: 'Buah',
      image: 's3_url_1',
    }
    const nanoCategory = {
      id: 'category-3',
      name: 'nano nano',
      image: 's3_url_1',
    }
    const seller2Category: SellerCategory = {
      id: 'seller2-category',
      seller: seller2,
      category: vegetableCategory,
      activation_date: new Date(1000),
      expiry_date: new Date(1000),
      status: 'paid'
    }
    const seller2CategoryBlocked: SellerCategory = {
      id: 'seller2-category-blocked',
      seller: seller2,
      category: fruitCategory,
      activation_date: null,
      expiry_date: null,
      status: 'blocked'
    }
    const seller3Category: SellerCategory = {
      id: 'seller3-category',
      seller: seller3,
      category: vegetableCategory,
      activation_date: new Date(2000),
      expiry_date: new Date(2000),
      status: 'paid'
    }
    const product1 = {
      id: 'product_1',
      name: 'KangKunG',
      price_per_quantity: 10000,
      discount: 0,
      description: 'kangkung',
      images: ['1'],
      category: seller2Category,
      seller: seller2,
      created_at: '2020-06-30 19:32:30',
      updated_at: null,
    };
    const product2 = {
      id: 'product_2',
      name: 'KangKunG',
      price_per_quantity: 10000,
      discount: 0,
      description: 'kangkung',
      images: ['1'],
      category: seller2Category,
      seller: seller2,
      created_at: '2020-06-30 19:32:30',
      updated_at: null,
    };
    const discussion1 = {
      id: 'discussion-1',
      user: user3,
      product: product1,
      description: 'discussion 1 ilmi',
      created_at: new Date(1),
      updated_at: null,
      deleted_at: null,
    };
    const discussions = [
      discussion1,
      {
        id: 'discussion-2',
        user: user3,
        product: product1,
        parent: discussion1,
        description: 'discussion 2',
        created_at: new Date(2),
        updated_at: null,
        deleted_at: null,
      },
      {
        id: 'discussion-3',
        user: user3,
        product: product2,
        description: 'discussion 3',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    ]
    const agenda: AgendaEntity = {
      id: 'agenda-1',
      title: 'anjay',
      description: 'a en je a ye',
      location: 'pare',
      date: new Date(1200),
      images: ['anjay.com'],
      type: 'pelatihan',
      sponsors: ['aenjeaye.com'],
      created_at: new Date(),
      updated_at: null,
      is_active: true
    }
    beforeEach(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          AdminModule,
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
        .useValue(fakeJwtAuthGuardFactory({ userId: 'admin-1', role: 'admin' }))
        .overrideProvider(RedisClientProvider)
        .useValue(fakeRedisClientProvider)
        .compile()
      
      app = moduleFixture.createNestApplication()
      await app.init()
  
      await getRepository(UserEntity).insert([admin, ...buyers, user4])
      await getRepository(SellerAttribute).insert([sellerNotActivated, seller2, seller3, seller4])
      await getRepository(OrderEntity).insert([order1, order2])
      await getRepository(CategoryEntity).insert([vegetableCategory, fruitCategory, nanoCategory]);
      await getRepository(SellerCategory).insert([seller2Category, seller3Category, seller2CategoryBlocked]);
      await getRepository(ProductEntity).insert([product1, product2]);
      await getRepository(DiscussionEntity).insert(discussions);
      await getRepository(AgendaEntity).insert(agenda);
    })

    afterEach(async () => {
      await getConnection().close();
    });

    it('should create agenda', async () => {
      const body = {
        title: 'asoy',
        description: 'geboy',
        location: 'ngebut',
        date: new Date(1200),
        images: ['di.com'],
        type: 'pembinaan',
        sponsors: ['jalan.com'],
      }
      const resp = await request(app.getHttpServer())
        .post('/admin/agenda')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual(`new agenda created`)
      const newAgenda = await getRepository(AgendaEntity).findOne( {title: 'asoy'} )
      expect(newAgenda).toBeDefined()
    })

    it('should edit agenda', async () => {
      const body = {
        title: 'asoy',
        description: 'geboy',
        location: 'ngebut',
        date: new Date(1200),
        images: ['di.com'],
        type: 'pembinaan',
        sponsors: ['jalan.com'],
      }
      const resp = await request(app.getHttpServer())
        .put('/admin/agenda/agenda-1')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual(`agenda [agenda-1] successfully edited`)
      const editedAgenda = await getRepository(AgendaEntity).findOne(agenda.id)
      expect(editedAgenda.title).toEqual(body.title)
      expect(editedAgenda.description).toEqual(body.description)
      expect(editedAgenda.location).toEqual(body.location)
      expect(editedAgenda.date).toEqual(body.date)
      expect(editedAgenda.images).toEqual(body.images)
      expect(editedAgenda.type).toEqual(body.type)
      expect(editedAgenda.sponsors).toEqual(body.sponsors)
    })

    it('should delete agenda', async () => {
      const resp = await request(app.getHttpServer())
        .delete('/admin/agenda/agenda-1')
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual(`agenda [agenda-1] successfully deleted`)
      const deletedAgenda = await getRepository(AgendaEntity).findOne(agenda.id)
      expect (deletedAgenda.is_active).toBeFalsy()
    })

    it('should list discussion', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/discussion')
        .expect(200)
      const { result, total } = resp.body
      expect(total).toEqual(2)
      expect(result).toHaveLength(2)
      expect(result[0].id).toEqual('discussion-2')
      expect(result[1].id).toEqual('discussion-1')
    })

    it('should list discussion with search', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/discussion?search=ilmi')
        .expect(200)
      const { result, total } = resp.body
      expect(total).toEqual(1)
      expect(result).toHaveLength(1)
      expect(result[0].id).toEqual('discussion-1')
    })

    it('should delete discussion', async () => {
      const resp = await request(app.getHttpServer())
        .delete('/admin/discussion/discussion-1')
        .expect(200)
      const { result, message } = resp.body
      expect(result).toBeNull()
      expect(message).toEqual('discussion deleted')
    })

    it('should list proposal', async () => {
      const proposal1: ProposalEntity = {
        id: 'proposal-1',
        user: user1,
        type: 'izin',
        created_at: new Date(100),
        is_active: true,
        data: []
      }
      const proposal2: ProposalEntity = {
        id: 'proposal-2',
        user: user2,
        type: 'izin',
        created_at: new Date(101),
        is_active: true,
        data: []
      }
      await getRepository(ProposalEntity).insert([proposal1, proposal2])
      const resp = await request(app.getHttpServer())
        .get('/admin/proposal')
        .expect(200)
      const { result, total } = resp.body
      expect(result.length).toEqual(2)
      expect(total).toEqual(2)
      expect(result[0].id).toEqual(proposal2.id)
      expect(result[1].id).toEqual(proposal1.id)
    })

    it('should count order for dashboard', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/order/count?dayFrom=1&monthFrom=5&yearFrom=2020&dayTo=1&monthTo=5&yearTo=2020')
        .expect(200)
      const { result } = resp.body
      expect(result.count).toEqual(1)
    })

    it('should count user for dashboard', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/user/count')
        .expect(200)
      const { result } = resp.body
      expect(result.userCount).toEqual(3)
      expect(result.sellerCount).toEqual(2)
      expect(result.newSellerCount).toEqual(2)
    })

    it('should list buyers sorted from oldest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=asc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted from newest', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=created&order=desc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted by full name ascending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=asc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should list buyers sorted by full name descending', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?sort_by=name&order=desc')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual('user-3')
      expect(result[1].id).toEqual('user-2')
      expect(result[2].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(3)
    })

    it('should limit buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-1')
      expect(page).toEqual(1)
      expect(limit).toEqual(1)
      expect(total).toEqual(3)
    })

    it('should paginate buyer', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?limit=1&page=2')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
      expect(page).toEqual(2)
      expect(limit).toEqual(1)
      expect(total).toEqual(3)
    })

    it('should get active buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=1')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('user-1')
      expect(result[1].id).toEqual('user-2')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(2)
    })

    it('should get inactive buyers only', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?active=0')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-3')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(1)
    })

    it('should search buyer by name', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/buyers?name=2')
        .expect(200)
      const { result, page, limit, total } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('user-2')
      expect(page).toEqual(1)
      expect(limit).toEqual(10)
      expect(total).toEqual(1)
    })

    it('should list seller', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(4)
      expect(result[0].id).toEqual('seller-4')
      expect(result[1].id).toEqual('seller-3')
      expect(result[2].id).toEqual('seller-2')
      expect(result[3].id).toEqual('seller-1')
    })

    it('should list active seller ', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=verified')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('seller-3')
      expect(result[1].id).toEqual('seller-2')
    })

    it('should list seller by category', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=category&category=category-1')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(seller2Category.id)
      expect(result[1].id).toEqual(seller3Category.id)
    })

    it('should list active seller order by name desc', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=verified&sort_by=name&order=asc')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('seller-2')
      expect(result[1].id).toEqual('seller-3')
    })

    it('should list not_verified seller', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=not_verified')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual('seller-4')
      expect(result[1].id).toEqual('seller-1')
    })

    it('should list seller by name', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller?filter=not_verified&name=d')
        .expect(200)
      const { result } = resp.body
      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual('seller-4')
    })

    it('should block seller', async () => {
      const body = { active: false }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-2')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller has been updated')
      const editedSeller = await getRepository(SellerAttribute).findOne('seller-2')
      expect(editedSeller.is_active).toBeFalsy()
    })

    it('should activate seller', async () => {
      const body = { active: true, tier: 2 }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller/seller-3')
        .send(body)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller has been updated')
      const editedSeller = await getRepository(SellerAttribute).findOne('seller-3')
      expect(editedSeller.is_active).toBeTruthy()
      expect(editedSeller.tier).toEqual(2)
      const editedUser = await getRepository(UserEntity).findOne(user3.id)
      expect(editedUser.role).toEqual('seller')
    })

    it('should get seller detail', async () => {
      const resp = await request(app.getHttpServer())
        .get('/admin/seller/seller-2')
        .expect(200)
      const { result } = resp.body
      expect(result.id).toEqual(seller2.id)
      expect(result.email).toEqual(seller2.user.email)
      expect(result.gender).toEqual(seller2.gender)
      expect(result.birth_place).toEqual(seller2.birth_place)
      expect(result.birth_date).toEqual(seller2.birth_date)
      expect(result.activation_date).toEqual(seller2.activation_date.toJSON())
      expect(result.shop_address).toEqual(seller2.shop_address)
      expect(result.description).toEqual(seller2.description)
      expect(result.tier).toEqual(seller2.tier)
      expect(result.is_active).toEqual(seller2.is_active)
      expect(result.registered_category.length).toEqual(2)
    })

    it('should activate seller category', async () => {
      const reqBody = {
        category: fruitCategory.id,
        expiry_date: '2020-10-05',
        status: 'paid'
      }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller-category/seller-2')
        .send(reqBody)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller category has been updated')
      const sellerCategory = await getRepository(SellerCategory).findOne(seller2CategoryBlocked.id)
      expect(sellerCategory.status).toEqual(reqBody.status)
      expect(sellerCategory.activation_date).toBeDefined()
      expect(sellerCategory.expiry_date).toEqual(new Date(reqBody.expiry_date))
    })

    it('should block seller category', async () => {
      const reqBody = {
        category: vegetableCategory.id,
        status: 'blocked'
      }
      const resp = await request(app.getHttpServer())
        .put('/admin/seller-category/seller-2')
        .send(reqBody)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller category has been updated')
      const sellerCategory = await getRepository(SellerCategory).findOne(seller2Category.id)
      expect(sellerCategory.status).toEqual(reqBody.status)
      expect(sellerCategory.activation_date).toBeNull()
      expect(sellerCategory.expiry_date).toBeNull()
    })

    it('should add seller category', async () => {
      const reqBody = {
        category: nanoCategory.id
      }
      const resp = await request(app.getHttpServer())
        .post('/admin/seller-category/seller-2')
        .send(reqBody)
        .expect(201)
      const { message } = resp.body
      expect(message).toEqual('seller category has been created')
      const sellerCategory = await getRepository(SellerCategory).findOne({
        relations: ['seller', 'category'],
        where: {
          seller: seller2.id,
          category: nanoCategory.id
        }
      })
      expect(sellerCategory.status).toEqual('proposed')
      expect(sellerCategory.activation_date).toBeNull()
      expect(sellerCategory.expiry_date).toBeNull()
    })
  })