import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { AdminService } from './admin.service';
import { UsersProvider } from '../../users/providers/users.provider';
import { OrderRepository } from '../../order/repositories/order.repository';

jest.mock('../../users/repositories/users.repository')
jest.mock('../../users/repositories/seller.repository')

describe('Admin Service', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        UserRepository,
        SellerAttributeRepository,
        UsersProvider,
        OrderRepository,
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});