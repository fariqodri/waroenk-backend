import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../auth/guards/role.permission.guard';
import { Roles } from '../utils/decorators';
import { ShopProductQuery, ProductDeleteParam, ProductPostParam } from './shop.dto';
import { ShopService } from './shop.service';
import { Request } from 'express';

@Controller('shop')
export class ShopController {
  constructor(private service: ShopService) {}

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Get('products')
  getProducts(@Query() {
    limit = 10,
    page = 1,
    search,
  }: ShopProductQuery, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.getProducts(user.userId, {
      limit,
      page,
      search,
    })
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Delete('products')
  @HttpCode(200)
  async delete(@Body() param: ProductDeleteParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.delete(user.userId, param.id);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Post('products')
  @HttpCode(201)
  async create(@Body() param: ProductPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.create(user.userId, param);
  }
}
