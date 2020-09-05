import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { AdminService } from './admin.service';
import { UsersProvider } from '../../users/providers/users.provider';
import { OrderRepository } from '../../order/repositories/order.repository';
import { ProposalRepository } from '../../proposal/repositories/proposal.repository';
import { DiscussionRepository } from '../../discussion/repositories/discussion.repository';
import { AgendaRepository } from '../../agenda/repositories/agenda.repository';
import { SellerCategoryRepository } from '../../products/repositories/seller-category.repository';

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
        ProposalRepository,
        DiscussionRepository,
        AgendaRepository,
        SellerCategoryRepository
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});