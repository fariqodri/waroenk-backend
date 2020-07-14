import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionService } from './discussion.service';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';

describe('DiscussionService', () => {
  let service: DiscussionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscussionService, UserRepository, DiscussionRepository, ProductRepository],
    }).compile();

    service = module.get<DiscussionService>(DiscussionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
