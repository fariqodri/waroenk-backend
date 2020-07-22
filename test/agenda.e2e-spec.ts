import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { AgendaEntity } from '../src/agenda/entities/agenda.entity';
import { AgendaModule } from '../src/agenda/agenda.module';

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
        is_active: true
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
        is_active: false
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
        is_active: true
      },
    ])
  });

  afterEach(async () => {
    await getConnection().close();
  });
  
  it('Query agenda with results', () => {
    return request(app.getHttpServer())
      .get('/agenda?title=training-1&location=jakarta')
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
            images: ['img-1.com']
          }
        ],
        page: 1,
        limit: 10,
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
        limit: 10,
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
            images: ['img-1.com']
          },
          {
            id: 'agenda-3',
            title: 'training-3',
            description: 'training3 bla bla bla',
            location: 'bogor',
            date: '2 May 2021',
            images: ['img-1.com']
          },
        ],
        page: 1,
        limit: 10,
      });
  })
});
