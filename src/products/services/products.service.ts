import { Injectable } from '@nestjs/common';
import { ResponseBody } from '../../utils/response';
import { ProductEntity } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductParam } from '../dto/productparam.dto';

@Injectable()
export class ProductsService {
  constructor(private productRepository:ProductRepository) {}

  async findAll(param: ProductParam): Promise<ResponseBody<ProductEntity>> {
    let products: ProductEntity[];
    const skippedItems = (param.page - 1) * param.limit;
    products = await this.productRepository.find({ take: param.limit, skip: skippedItems })
    return new ResponseBody(products);
  }
}
