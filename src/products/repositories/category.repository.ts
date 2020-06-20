import { EntityRepository, Repository } from 'typeorm'
import { CategoryEntity } from '../entities/categories.entity';

@EntityRepository(CategoryEntity)
export class CategoryRepository extends Repository<CategoryEntity> {}
