import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { JwtStrategy } from './jwt.strategy';

jest.mock('../redis/redis.service')

describe('Auth Controller', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        RedisService,
      ],
      imports: [
        UsersModule,
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
});
