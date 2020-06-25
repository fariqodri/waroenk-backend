import { Injectable } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { ProductEntity } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductRepository) {}

  async findAll(search?: string): Promise<ResponseBody<ProductEntity>> {
    let products: ProductEntity[];
    if (search) {
      products = await this.productRepository
        .createQueryBuilder()
        .where('LOWER(name) LIKE :name', { name: `%${search.toLowerCase()}%` })
        .getMany();
      return new ResponseBody(products);
    }
    products = await this.productRepository.find();
    return new ResponseBody(products);
  }
}
