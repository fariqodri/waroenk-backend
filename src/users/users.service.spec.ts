import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { RegisterDto } from './users.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
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
    const user = await service.register(registerBody)
    expect(user).not.toHaveProperty("password")
    expect(user).toHaveProperty("id")
    expect(user.full_name).toEqual(registerBody.full_name)
    expect(user.email).toEqual(registerBody.email)
    expect(user.phone).toEqual(registerBody.phone)
  })

  it('should throw error on password and confirm password inequality', () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123tes098"
    }
    const rejection = expect(service.register(registerBody)).rejects
    rejection.toBeDefined()
    rejection.toBeInstanceOf(BadRequestException)
  })
});
