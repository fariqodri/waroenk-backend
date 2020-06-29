import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductQuery } from '../dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() {
      search,
      price_from: priceFrom,
      price_to: priceTo,
      category: categoryId,
      sort_by: sortBy,
      limit = 10,
      page = 1,
      sort_type: sortType
    }: ProductQuery,
    // @Query('search') search?: string,
    // @Query('price_from') priceFrom?: number,
    // @Query('price_to') priceTo?: number,
    // @Query('category') categoryId?: string,
    // @Query('sort_by') sortBy?: string,
    // @Query('limit') limit = 10,
    // @Query('page') page = 1,
    // @Query('sort_type') sortType = 'desc'
  ) {
    return this.productsService.findAll({
      search,
      limit,
      page,
      sort_by: sortBy,
      price_from: priceFrom,
      price_to: priceTo,
      category: categoryId,
      sort_type: sortType
    });
  }
}
