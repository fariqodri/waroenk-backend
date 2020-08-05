import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/repositories/users.repository';
import { ProposalRepository } from './repositories/proposal.repository';
import { ProposalDataRepository } from './repositories/proposal-data.repository';
import { ProposalItemRepository } from './repositories/proposal-item.repository';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';

@Module({
  imports: [TypeOrmModule.forFeature([
      ProposalRepository,
      ProposalDataRepository,
      ProposalItemRepository, 
      UserRepository
    ])],
  controllers: [ProposalController],
  providers: [ProposalService],
  exports: [TypeOrmModule.forFeature([
      ProposalRepository,
      ProposalDataRepository,
      ProposalItemRepository
    ])]
})
export class ProposalModule {}
