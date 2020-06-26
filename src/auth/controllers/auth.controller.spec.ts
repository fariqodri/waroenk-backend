import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersModule } from '../../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';
import { JwtStrategy } from '../providers/jwt.strategy';
import { UsersService } from '../../users/services/users.service';
import { PermissionService } from '../../permission/permission.service';
import { UserRepository } from '../../users/repositories/users.repository';

jest.mock('../../redis/redis.service')
jest.mock('../../users/repositories/users.repository')

describe('Auth Controller', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        RedisService,
        UsersService,
        PermissionService,
        UserRepository
      ],
      imports: [
        JwtModule.register({}),
      ]
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call AuthService.logout', () => {
    const spy = jest.spyOn(service, "logout").mockImplementation()
    const request: any = {
      headers: {
        authorization: "Bearer fake_token"
      }
    }
    controller.logout(request)
    expect(spy).toBeCalled()
  })

  it('should call login service', () => {
    const spy = jest.spyOn(service, 'login').mockImplementation()
    controller.login({ email: 'user@example.com', password: 'password' })
    expect(spy).toBeCalledWith('user@example.com', 'password')
  })
});
