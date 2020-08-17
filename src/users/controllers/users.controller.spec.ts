import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { RegisterDto } from '../dto/users.dto';
import { BadRequestException } from '@nestjs/common';
import { PermissionModule } from '../../permission/permission.module';
import { UserRepository } from '../repositories/users.repository';
import { SellerAttributeRepository } from '../repositories/seller.repository';
import { ShippingAddressRepository } from '../repositories/shipping-address.repository';
import { MiscService } from '../../misc/services/misc.service';

jest.mock('../repositories/users.repository')
jest.mock('../repositories/seller.repository')
jest.mock('../repositories/shipping-address.repository')

describe('Users Controller', () => {
  let controller: UsersController;
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UserRepository, SellerAttributeRepository, ShippingAddressRepository, MiscService],
      imports: [PermissionModule]
    })
      .overrideProvider(MiscService)
      .useValue({})
      .compile();

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
      confirm_password: "test123test123",
      role: "buyer"
    }
    const spy = jest.spyOn(service, 'register').mockImplementation()
    await controller.register(registerBody)
    expect(spy).toBeCalledTimes(1)
  })

  it('should return 400 Bad Request from service', () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123tes098",
      role: "buyer"
    }
    jest.spyOn(service, 'register').mockImplementation(async () => {
      throw new BadRequestException()
    })
    expect(controller.register(registerBody)).rejects.toBeInstanceOf(BadRequestException)
  })
});
