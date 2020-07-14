import { EntityRepository, Repository } from 'typeorm'
import { DiscussionEntity } from '../entities/discussion.entity';

@EntityRepository(DiscussionEntity)
export class DiscussionRepository extends Repository<DiscussionEntity> {}
