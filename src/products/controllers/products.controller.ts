import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductParam } from '../dto/productparam.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService
  ) {}

  @Get()
  findAll(@Query() param: ProductParam) {
  	param.page = Number(param.page)
    param.limit = Number(param.limit)
    return this.productsService.findAll(param)
  }
}
