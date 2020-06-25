import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService
  ) {}

  @Get()
  findAll(@Query("search") search?: string) {
    return this.productsService.findAll(search)
  }
}
