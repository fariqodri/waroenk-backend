import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('limit') limit = 10, @Query('page') page = 1) {
    return this.productsService.findAll({
      search,
      limit,
      page
    })
  }
}
