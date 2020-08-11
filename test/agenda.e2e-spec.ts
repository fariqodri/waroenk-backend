import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { AgendaEntity } from '../src/agenda/entities/agenda.entity';
import { AgendaModule } from '../src/agenda/agenda.module';
import { UserEntity } from '../src/users/entities/users.entity';
import { DiscussionEntity } from '../src/discussion/entities/discussion.entity';
import { ProductEntity } from '../src/products/entities/product.entity';
import { CategoryEntity } from '../src/products/entities/category.entity';
import { SellerAttribute } from '../src/users/entities/seller.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { ProposalEntity } from '../src/proposal/entities/proposal.entity';
import { ProposalData } from '../src/proposal/entities/proposal-data.entity';
import { OptionalJwtAuthGuard } from '../src/auth/guards/optional-jwt-auth.guard';
import { OrderEntity } from '../src/order/entities/order.entity';
import { OrderItem } from '../src/order/entities/order-item.entity';
import { CartEntity } from '../src/order/entities/cart.entity';

describe('Agenda (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AgendaModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AgendaEntity,
            UserEntity,
            DiscussionEntity,
            ProductEntity,
            CategoryEntity,
            SellerAttribute,
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
    await getRepository(AgendaEntity).insert([
      {
        id: 'agenda-1',
        title: 'training-1',
        description: 'training1 bla bla bla',
        location: 'jakarta',
        date: '12 May 2021',
        images: ['img-1.com'],
        created_at: new Date(),
        updated_at: null,
        is_active: true,
        type: 'pelatihan',
        sponsors: ['sponsor1.com']
      },
      {
        id: 'agenda-2',
        title: 'training-2',
        description: 'training2 bla bla bla',
        location: 'bandung',
        date: '12 May 2022',
        images: ['img-1.com'],
        created_at: new Date(),
        updated_at: null,
        is_active: false,
        type: 'pembinaan',
        sponsors: ['sponsor2.com']
      },
      {
        id: 'agenda-3',
        title: 'training-3',
        description: 'training3 bla bla bla',
        location: 'bogor',
        date: '2 May 2021',
        images: ['img-1.com'],
        created_at: new Date(),
        updated_at: null,
        is_active: true,
        type: 'pelatihan',
        sponsors: ['sponsor3.com']
      },
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });
  
  it('Query agenda with results', () => {
    return request(app.getHttpServer())
      .get('/agenda?title=training-1&location=jakarta&type=pelatihan')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'agenda-1',
            title: 'training-1',
            description: 'training1 bla bla bla',
            location: 'jakarta',
            date: '12 May 2021',
            images: ['img-1.com'],
            type: 'pelatihan',
            sponsors: ['sponsor1.com']
          }
        ],
        page: 1,
        limit: 1,
      });
  });

  it('Query agenda without results', () => {
    return request(app.getHttpServer())
      .get('/agenda?title=SALAH')
      .expect(200)
      .expect({
        message: 'ok',
        result: [],
        page: 1,
        limit: 0,
      });
  })

  it('Query agenda without search', () => {
    return request(app.getHttpServer())
      .get('/agenda')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'agenda-1',
            title: 'training-1',
            description: 'training1 bla bla bla',
            location: 'jakarta',
            date: '12 May 2021',
            images: ['img-1.com'],
            type: 'pelatihan',
            sponsors: ['sponsor1.com']
          },
          {
            id: 'agenda-3',
            title: 'training-3',
            description: 'training3 bla bla bla',
            location: 'bogor',
            date: '2 May 2021',
            images: ['img-1.com'],
            type: 'pelatihan',
            sponsors: ['sponsor3.com']
          },
        ],
        page: 1,
        limit: 2,
      });
  })

  it('detail agenda without login', () => {
    return request(app.getHttpServer())
      .get('/agenda/agenda-1')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          id: 'agenda-1',
          title: 'training-1',
          description: 'training1 bla bla bla',
          location: 'jakarta',
          date: '12 May 2021',
          type: 'pelatihan',
          images: [ 'img-1.com' ],
          sponsors: [ 'sponsor1.com' ],
          is_active: true,
          is_my_agenda: false
        }
      });
  });
});

const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}

describe('Agenda with users (e2e)', () => {
  let app: INestApplication;
  const fakeJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' }
      return true
    })
  }
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
  const agenda1: AgendaEntity = {
    id: 'agenda-1',
    title: 'training-1',
    description: 'training1 bla bla bla',
    location: 'jakarta',
    date: '12 May 2021',
    images: ['img-1.com'],
    created_at: new Date(3),
    updated_at: null,
    is_active: true,
    users: [user1],
    type: 'pelatihan',
    sponsors: ['sponsor1.com']
  }
  const agenda2: AgendaEntity = {
    id: 'agenda-2',
    title: 'training-2',
    description: 'training2 bla bla bla',
    location: 'bandung',
    date: '12 May 2022',
    images: ['img-2.com'],
    created_at: new Date(2),
    updated_at: null,
    is_active: true,
    users: [user1],
    type: 'pembinaan',
    sponsors: ['sponsor2.com']
  }
  const agenda3: AgendaEntity = {
    id: 'agenda-3',
    title: 'training-3',
    description: 'training3 bla bla bla',
    location: 'bogor',
    date: '2 May 2021',
    images: ['img-3.com'],
    created_at: new Date(1),
    updated_at: null,
    is_active: true,
    type: 'pelatihan',
    sponsors: ['sponsor3.com']
  }
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AgendaModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AgendaEntity,
            UserEntity,
            DiscussionEntity,
            ProductEntity,
            CategoryEntity,
            SellerAttribute,
            ProposalEntity,
            ProposalData,
            OrderEntity,
            OrderItem,
            CartEntity
          ],
        }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .compile()
    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(UserEntity).insert([user1]);
    await getRepository(AgendaEntity).insert([agenda1, agenda2, agenda3])
    user1.savedAgendas = [agenda1, agenda2]
    await getRepository(UserEntity).save([user1]);
  });

  afterEach(async () => {
    await getConnection().close();
  });
  
  it('Query saved agenda with results', () => {
    return request(app.getHttpServer())
      .get('/myAgenda')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'agenda-1',
            title: 'training-1',
            description: 'training1 bla bla bla',
            location: 'jakarta',
            date: '12 May 2021',
            images: ['img-1.com'],
            type: 'pelatihan',
            sponsors: ['sponsor1.com']
          },
          {
            id: 'agenda-2',
            title: 'training-2',
            description: 'training2 bla bla bla',
            location: 'bandung',
            date: '12 May 2022',
            images: ['img-2.com'],
            type: 'pembinaan',
            sponsors: ['sponsor2.com']
          }  
        ],
        page: 1,
        limit: 2,
      });
  });

  it('should save agenda', () => {
    return request(app.getHttpServer())
      .post('/myAgenda/agenda-3')
      .expect(201)
      .expect({
        message: 'ok',
        result: 'agenda successfully saved'
      });
  });

  it('should unsave agenda', () => {
    return request(app.getHttpServer())
      .delete('/myAgenda/agenda-1')
      .expect(200)
      .expect({
        message: 'ok',
        result: 'agenda successfully unsaved'
      });
  });
});

describe('Agenda with optional login (e2e)', () => {
  let app: INestApplication;
  const fakeOptionalJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      if (req.headers.authorization) {
        req.user = { userId: 'user-1', issuedAt: 1, expiredAt: 2, role: 'buyer' }
      }
      return true
    })
  }
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
  const agenda1: AgendaEntity = {
    id: 'agenda-1',
    title: 'training-1',
    description: 'training1 bla bla bla',
    location: 'jakarta',
    date: '12 May 2021',
    images: ['img-1.com'],
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    users: [user1],
    type: 'pelatihan',
    sponsors: ['sponsor1.com']
  }
  const agenda2: AgendaEntity = {
    id: 'agenda-2',
    title: 'training-2',
    description: 'training2 bla bla bla',
    location: 'bandung',
    date: '12 May 2022',
    images: ['img-2.com'],
    created_at: new Date(),
    updated_at: null,
    is_active: true,
    type: 'pembinaan',
    sponsors: ['sponsor2.com']
  }
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AgendaModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AgendaEntity,
            UserEntity,
            DiscussionEntity,
            ProductEntity,
            CategoryEntity,
            SellerAttribute,
            ProposalEntity,
            ProposalData,
            OrderEntity,
            OrderItem,
            CartEntity
          ],
        }),
      ],
    })
      .overrideProvider(RedisClientProvider)
      .useValue(fakeRedisClientProvider)
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue(fakeOptionalJwtAuthGuard)
      .compile()
    app = moduleFixture.createNestApplication();
    await app.init();
    await getRepository(UserEntity).insert([user1]);
    await getRepository(AgendaEntity).insert([agenda1, agenda2])
    user1.savedAgendas = [agenda1, agenda2]
    await getRepository(UserEntity).save([user1]);
  });

  afterEach(async () => {
    await getConnection().close();
  });

  it('detail agenda with login', () => {
    return request(app.getHttpServer())
      .get('/agenda/agenda-1')
      .set('Authorization', 'Bearer fake_token')
      .expect(200)
      .expect({
        message: 'ok',
        result: {
          id: 'agenda-1',
          title: 'training-1',
          description: 'training1 bla bla bla',
          location: 'jakarta',
          date: '12 May 2021',
          type: 'pelatihan',
          images: [ 'img-1.com' ],
          sponsors: [ 'sponsor1.com' ],
          is_active: true,
          is_my_agenda: true
        }
      });
  });
});