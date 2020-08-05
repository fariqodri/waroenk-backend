import { EntityRepository, Repository } from 'typeorm';
import { ProposalData } from '../entities/proposal-data.entity';

@EntityRepository(ProposalData)
export class ProposalDataRepository extends Repository<ProposalData> {}
