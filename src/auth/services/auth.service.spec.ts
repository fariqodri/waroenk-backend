import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../users/repositories/users.repository';
import { PermissionService } from '../../permission/permission.service';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

jest.mock('../../redis/redis.service')
jest.mock('../../users/repositories/users.repository')
jest.mock('../../users/repositories/seller.repository')

describe('AuthService', () => {
  let service: AuthService;
  let redisService: RedisService
  let jwtService: JwtService
  let userService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        RedisService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake_token')
          }
        },
        UsersService,
        PermissionService,
        UserRepository,
        SellerAttributeRepository
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    redisService = module.get(RedisService)
    jwtService = module.get(JwtService)
    userService = module.get(UsersService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call redis service', async () => {
    await service.logout("fake_token", 2, 1)
    expect(redisService.set).toBeCalled()
  });

  it('should return token on login', async () => {
    // @ts-ignore
    const spy = jest.spyOn(userService, 'findOne').mockResolvedValue({
      id: 'id_1',
      email: 'user@example.com',
      password: 'password'
    })
    const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true)
    await service.login('user@example.com', 'password')
    expect(spy).toBeCalledWith({ email: 'user@example.com' })
    expect(bcryptCompareSpy).toBeCalledWith('password', 'password')
  })
});
