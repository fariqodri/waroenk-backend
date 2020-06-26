import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { RegisterDto } from '../dto/users.dto';
import { BadRequestException } from '@nestjs/common';
import { PermissionService } from '../../permission/permission.service';
import { BUYER_ROLE_ID } from '../../constants';
import { PermissionModule } from '../../permission/permission.module';
import { UserRepository } from '../repositories/users.repository';
import { UserEntity } from '../entities/users.entity';

jest.mock('../repositories/users.repository')

describe('UsersService', () => {
  let service: UsersService;
  let permissionService: PermissionService
  let userRepo: UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PermissionModule],
      providers: [UsersService, UserRepository]
    }).compile();

    service = module.get<UsersService>(UsersService);
    permissionService = module.get(PermissionService)
    userRepo = module.get(UserRepository)
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
      confirm_password: "test123test123",
      role: "buyer"
    }
    const spy = jest.spyOn(permissionService, "addMemberToRole").mockImplementation()
    const insertSpy = jest.spyOn(userRepo, 'insert').mockImplementation()
    const user = await service.register(registerBody)
    expect(user).not.toHaveProperty("password")
    expect(user).toHaveProperty("id")
    expect(user.full_name).toEqual(registerBody.full_name)
    expect(user.email).toEqual(registerBody.email)
    expect(user.phone).toEqual(registerBody.phone)
    expect(user.role).toEqual(registerBody.role)
    expect(spy).toBeCalledWith(user.id, BUYER_ROLE_ID)
    expect(insertSpy).toBeCalled()
  })

  it('should throw error on password and confirm password inequality', () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123tes098",
      role: "buyer"
    }
    const spy = jest.spyOn(permissionService, "addMemberToRole").mockImplementation()
    const rejection = expect(service.register(registerBody)).rejects
    rejection.toBeDefined()
    rejection.toBeInstanceOf(BadRequestException)
    expect(spy).not.toHaveBeenCalled()
  });

  it('should get a user from the repository', async () => {
    const user: UserEntity = {
      id: 'id_1',
      email: 'user@example.com',
      full_name: 'User 1',
      phone: '08132312321',
      password: 'password',
      role: 'buyer'
    }
    const findSpy = jest.spyOn(userRepo, 'findOneOrFail').mockImplementation(async () => user)
    const result = await service.findOne({ id: 'id_1' })
    expect(findSpy).toBeCalledWith({ where: { id: 'id_1' } })
    expect(result).toEqual(user)
  })
});
