import { EntityRepository, Repository } from 'typeorm';
import { ProposalItem } from '../entities/proposal-item.entity';

@EntityRepository(ProposalItem)
export class ProposalItemRepository extends Repository<ProposalItem> {}
