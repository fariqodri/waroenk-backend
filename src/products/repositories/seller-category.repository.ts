import { EntityRepository, Repository } from 'typeorm'
import { SellerCategory } from '../entities/seller-category.entity';

@EntityRepository(SellerCategory)
export class SellerCategoryRepository extends Repository<SellerCategory> {}
