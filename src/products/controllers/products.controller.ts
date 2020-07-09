import { Controller, Get, Query, Delete, HttpCode, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductQuery } from '../dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() {
      search,
      price_from,
      price_to,
      category,
      sort_by,
      limit = 10,
      page = 1,
      sort_type
    }: ProductQuery
  ) {
    return this.productsService.findAll({
      search,
      limit,
      page,
      sort_by,
      price_from,
      price_to,
      category,
      sort_type
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id) 
  }
}
