import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { AdminService } from '../services/admin.service';
import { AdminController } from './admin.controller';
import { UsersProvider } from '../../users/providers/users.provider';
import { OrderRepository } from '../../order/repositories/order.repository';
import { ProposalRepository } from '../../proposal/repositories/proposal.repository';
import { DiscussionRepository } from '../../discussion/repositories/discussion.repository';

describe('Admin Service', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminController],
      providers: [
        AdminService,
        UserRepository,
        SellerAttributeRepository,
        UsersProvider,
        OrderRepository,
        ProposalRepository,
        DiscussionRepository
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
});