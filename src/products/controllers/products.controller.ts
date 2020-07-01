import { Controller, Get, Query, Delete, HttpCode, Body, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductQuery } from '../dto/product.dto';
import { Roles } from '../../utils/decorators';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../../auth/guards/role.permission.guard';
import { Request } from 'express';

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

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Delete()
  @HttpCode(200)
  async login(@Body() id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.productsService.delete(user.userId, id);
  }

}
