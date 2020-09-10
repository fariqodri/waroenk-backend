import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { getConnection, getRepository } from 'typeorm';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ProposalData } from '../src/proposal/entities/proposal-data.entity';
import { ProposalItem } from '../src/proposal/entities/proposal-item.entity';
import { ProposalEntity } from '../src/proposal/entities/proposal.entity';
import { ProposalModule } from '../src/proposal/proposal.module';
import { RedisClientProvider } from '../src/redis/redis.client.provider';
import { UserEntity } from '../src/users/entities/users.entity';
import { entities } from './dependencies';

const fakeRedisClientProvider = {
  set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
  get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
}
  
describe('Proposals (e2e)', () => {
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
  const item1: ProposalItem = {
    id: 'item-1',
    type: 'modal',
    item: 'nama',
    created_at: new Date(),
    is_active: true
  }
  const item2: ProposalItem = {
    id: 'item-2',
    type: 'modal',
    item: 'alamat',
    created_at: new Date(),
    is_active: true
  }
  const proposal1: ProposalEntity = {
    id: 'pr-1',
    user: user1,
    type: 'modal',
    created_at: new Date(1000),
    is_active: true
  }
  const proposal2: ProposalEntity = {
    id: 'pr-2',
    user: user1,
    type: 'ekspor',
    created_at: new Date(999),
    is_active: true
  }
  const data1: ProposalData = {
    id: 'data-1',
    proposal: proposal1,
    key: 'nama',
    value: 'jojon',
    created_at: new Date(),
    is_active: true
  }
  const data2: ProposalData = {
    id: 'data-2',
    proposal: proposal1,
    key: 'alamat',
    value: 'nangor',
    created_at: new Date(),
    is_active: true
  }
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ProposalModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: entities,
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
    await getRepository(ProposalItem).insert([item1, item2]);
    await getRepository(ProposalEntity).insert([proposal1, proposal2]);
    await getRepository(ProposalData).insert([data1, data2]);
  });

  afterEach(async () => {
    await getConnection().close();
  });
  
  it('list proposal item', () => {
    return request(app.getHttpServer())
      .get('/proposal?type=modal')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { id: 'item-1', type: 'modal', item: 'nama' },
          { id: 'item-2', type: 'modal', item: 'alamat' }
        ],
        page: 1,
        limit: 2,
      });
  });

  it('list user proposal', () => {
    return request(app.getHttpServer())
      .get('/proposal/myProposal')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'pr-1',
            type: 'modal',
            created_at: '1970-01-01 00:00:01.000'
          },
          {
            id: 'pr-2',
            type: 'ekspor',
            created_at: '1970-01-01 00:00:00.999'
          }
        ],
        page: 1,
        limit: 2
      });
  });

  it('list user proposal with query', () => {
    return request(app.getHttpServer())
      .get('/proposal/myProposal?type=modal')
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          {
            id: 'pr-1',
            type: 'modal',
            created_at: '1970-01-01 00:00:01.000'
          }
        ],
        page: 1,
        limit: 1
      });
  });

  it('detail proposal', () => {
    return request(app.getHttpServer())
      .get('/proposal/pr-1')
      .send({ type: 'modal' })
      .expect(200)
      .expect({
        message: 'ok',
        result: [
          { id: 'data-1', key: 'nama', value: 'jojon' },
          { id: 'data-2', key: 'alamat', value: 'nangor' }
        ],
        page: 1,
        limit: 2
      });
  });

  it('save proposal', () => {
    return request(app.getHttpServer())
      .post('/proposal')
      .send({ type: 'modal', data: [
        ['nama', 'cecep'],
        ['alamat', 'jalan bandung']
      ]})
      .expect(201)
      .then(res => {
        const body = res.body
        const { message, result } = body
        const { id, userId, type } = result
        expect(message).toEqual('ok')
        expect(id).toBeDefined()
        expect(userId).toEqual(user1.id)
        expect(type).toEqual('modal')
      })
  });
});