import { EntityRepository, Repository } from 'typeorm';
import { SponsorEntity } from '../entities/sponsor.entity';

@EntityRepository(SponsorEntity)
export class SponsorRepository extends Repository<SponsorEntity> {}
