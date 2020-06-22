import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { RegisterDto } from './users.dto';
import { BadRequestException } from '@nestjs/common';
import { PermissionService } from '../permission/permission.service';
import { BUYER_ROLE_ID } from '../constants';
import { PermissionModule } from '../permission/permission.module';

describe('UsersService', () => {
  let service: UsersService;
  let permissionService: PermissionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PermissionModule],
      providers: [UsersService]
    }).compile();

    service = module.get<UsersService>(UsersService);
    permissionService = module.get(PermissionService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user entity', async () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123test123"
    }
    const spy = jest.spyOn(permissionService, "addMemberToRole").mockImplementation()
    const user = await service.register(registerBody)
    expect(user).not.toHaveProperty("password")
    expect(user).toHaveProperty("id")
    expect(user.full_name).toEqual(registerBody.full_name)
    expect(user.email).toEqual(registerBody.email)
    expect(user.phone).toEqual(registerBody.phone)
    expect(spy).toBeCalledWith(user.id, BUYER_ROLE_ID)
  })

  it('should throw error on password and confirm password inequality', () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123tes098"
    }
    const spy = jest.spyOn(permissionService, "addMemberToRole").mockImplementation()
    const rejection = expect(service.register(registerBody)).rejects
    rejection.toBeDefined()
    rejection.toBeInstanceOf(BadRequestException)
    expect(spy).not.toHaveBeenCalled()
  })
});
