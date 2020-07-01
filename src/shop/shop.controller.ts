import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../auth/guards/role.permission.guard';
import { Roles } from '../utils/decorators';
import { ShopProductQuery } from './shop.dto';
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
  @Delete()
  @HttpCode(200)
  async login(@Body() id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.delete(user.userId, id);
  }
}
