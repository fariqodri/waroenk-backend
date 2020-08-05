import { Test, TestingModule } from '@nestjs/testing';
import { ProposalService } from '../services/proposal.service';
import { ProposalRepository } from '../repositories/proposal.repository';
import { ProposalDataRepository } from '../repositories/proposal-data.repository';
import { ProposalItemRepository } from '../repositories/proposal-item.repository';
import { ProposalController } from './proposal.controller';
import { UserRepository } from '../../users/repositories/users.repository';

jest.mock('../repositories/proposal.repository')
jest.mock('../repositories/proposal-data.repository')
jest.mock('../repositories/proposal-item.repository')
jest.mock('../../users/repositories/users.repository')

describe('Proposal Controller', () => {
  let controller: ProposalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalController],
      providers: [ProposalService, ProposalRepository, ProposalDataRepository, ProposalItemRepository, UserRepository]
    }).compile();

    controller = module.get<ProposalController>(ProposalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
