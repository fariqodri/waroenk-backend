import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { AdminService } from '../services/admin.service';
import { AdminController } from './admin.controller';

jest.mock('../../users/repositories/users.repository')
jest.mock('../../users/repositories/seller.repository')

describe('Admin Service', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminController],
      providers: [
        AdminService,
        UserRepository,
        SellerAttributeRepository],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
});