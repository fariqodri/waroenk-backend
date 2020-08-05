import { Test, TestingModule } from '@nestjs/testing';
import { ProposalService } from './proposal.service';
import { ProposalRepository } from '../repositories/proposal.repository';
import { ProposalItemRepository } from '../repositories/proposal-item.repository';
import { ProposalDataRepository } from '../repositories/proposal-data.repository';
import { UserRepository } from '../../users/repositories/users.repository';

jest.mock('../repositories/proposal.repository')
jest.mock('../repositories/proposal-data.repository')
jest.mock('../repositories/proposal-item.repository')
jest.mock('../../users/repositories/users.repository')

describe('Proposal Service', () => {
  let service: ProposalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalService, ProposalRepository, ProposalItemRepository, ProposalDataRepository, UserRepository],
    }).compile();

    service = module.get<ProposalService>(ProposalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});
