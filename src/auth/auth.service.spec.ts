import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

jest.mock('../redis/redis.service')

describe('AuthService', () => {
  let service: AuthService;
  let redisService: RedisService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        RedisService,
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn().mockReturnValue({ iat: 1, exp: 2 })
          }
        }
      ],
      imports: [UsersModule]
    }).compile();

    service = module.get<AuthService>(AuthService);
    redisService = module.get(RedisService)
    jwtService = module.get(JwtService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call redis service', async () => {
    await service.logout("fake_token")
    expect(redisService.set).toBeCalled()
    expect(jwtService.decode).toBeCalledWith("fake_token")
  })
});
