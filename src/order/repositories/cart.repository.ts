import { EntityRepository, Repository } from 'typeorm'
import { CartEntity } from '../entities/cart.entity';

@EntityRepository(CartEntity)
export class CartRepository extends Repository<CartEntity> {}
