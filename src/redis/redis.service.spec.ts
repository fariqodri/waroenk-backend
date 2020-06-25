import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { RedisClientProvider } from './redis.client.provider';

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: RedisClientProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: RedisClientProvider,
          useValue: {
            set: jest.fn().mockImplementation((key, value, mode, duration, cb) => cb(null, 'OK')),
            get: jest.fn().mockImplementation((key, cb) => cb(null, `{}`)),
          }
        }
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = module.get(RedisClientProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call redis set function', async () => {
    await service.set('mock', null, 60);
    expect(redisClient.set).toBeCalled()
  })

  it('should call redis get function', async () => {
    const result = await service.get('mock');
    expect(result).toEqual({})
    expect(redisClient.get).toBeCalled()
  })
});
