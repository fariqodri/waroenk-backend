import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body, Post, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../auth/guards/role.permission.guard';
import { Roles } from '../utils/decorators';
import { ShopProductQuery, ProductDeleteParam, ProductPostParam, ShopPostParam } from './shop.dto';
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
  async deleteProduct(@Body() param: ProductDeleteParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.deleteProduct(user.userId, param.id);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Post('products')
  @HttpCode(201)
  async createProduct(@Body() param: ProductPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createProduct(user.userId, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Put('products')
  @HttpCode(201)
  async editProduct(@Body() param: ProductPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.editProduct(user.userId, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Post()
  @HttpCode(201)
  async createShop(@Body() param: ShopPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createShop(user.userId, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Put()
  @HttpCode(201)
  async editShop(@Body() param: ShopPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.editShop(user.userId, param);
  }
}
