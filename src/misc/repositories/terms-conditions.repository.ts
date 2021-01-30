import { EntityRepository, Repository } from 'typeorm';
import { SellerTermsConditionsEntity } from '../entities/terms-conditions.entity';

@EntityRepository(SellerTermsConditionsEntity)
export class SellerTermsConditionsRepository extends Repository<SellerTermsConditionsEntity> {}
