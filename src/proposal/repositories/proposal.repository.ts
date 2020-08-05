import { EntityRepository, Repository } from 'typeorm';
import { ProposalEntity } from '../entities/proposal.entity';

@EntityRepository(ProposalEntity)
export class ProposalRepository extends Repository<ProposalEntity> {}
