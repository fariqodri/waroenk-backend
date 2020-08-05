import { Controller, Get, Query, Req, Param, Headers, UseGuards } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductQuery } from '../dto/product.dto';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService
  ) {}

  @Get()
  findAll(
    @Query() {
      search,
      price_from,
      price_to,
      categories,
      sort_by,
      limit = 10,
      page = 1,
      sort_type
    }: ProductQuery) {
      return this.productsService.findAll({
        search,
        limit,
        page,
        sort_by,
        price_from,
        price_to,
        categories,
        sort_type
      });
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() request: Request) {
    let userId = ''
    let role: string
    if (request.user) {
      const user: { userId, role } = request.user as { userId, role }
      userId = user.userId
      role = user.role
    }
    return this.productsService.findOne(id, userId, role) 
  }
}
