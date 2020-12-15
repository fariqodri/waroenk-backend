import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from '../services/discussion.service';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { LoggerModule } from 'nestjs-pino';

describe('Discussion Controller', () => {
  let controller: DiscussionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscussionController],
      providers: [
        DiscussionService, 
        UserRepository, 
        DiscussionRepository, 
        ProductRepository,
        SellerAttributeRepository],
      imports: [LoggerModule.forRoot()]
    }).compile();

    controller = module.get<DiscussionController>(DiscussionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
