import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RegisterDto } from './users.dto';
import { BadRequestException } from '@nestjs/common';

describe('Users Controller', () => {
  let controller: UsersController;
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register method in service', async () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123test123"
    }
    const spy = jest.spyOn(service, 'register')
    await controller.register(registerBody)
    expect(spy).toBeCalledTimes(1)
  })

  it('should return 400 Bad Request from service', () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123tes098"
    }
    jest.spyOn(service, 'register').mockImplementation(async () => {
      throw new BadRequestException()
    })
    expect(controller.register(registerBody)).rejects.toBeInstanceOf(BadRequestException)
  })
});
