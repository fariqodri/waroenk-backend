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
    products = await this.productRepository
      .createQueryBuilder("product")
      .skip(skippedItems)
      .take(param.limit)
      .getMany();
    return new ResponseBody(products);
  }
}
