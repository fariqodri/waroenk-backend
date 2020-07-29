import { EntityRepository, Repository } from 'typeorm'
import { FaqEntity } from '../entities/faq.entity';

@EntityRepository(FaqEntity)
export class FaqRepository extends Repository<FaqEntity> {}
