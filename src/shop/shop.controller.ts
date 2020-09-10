import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body, Post, Put, UsePipes, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../auth/guards/role.permission.guard';
import { Roles } from '../utils/decorators';
import { ShopProductQuery, ProductCreateParam, ProductEditParam, ShopPostParam, SellerBankParam, EditSellerBankParam } from './shop.dto';
import { ShopService } from './shop.service';
import { Request } from 'express';
import { ValidationPipe } from '../utils/validation.pipe';
import { OrderQueryParam } from '../order/dto/order.dto';

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
  @Get('category')
  getCategories(@Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.getEligibleCategories(user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Delete('products/:id')
  @HttpCode(200)
  async deleteProduct(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.deleteProduct(id, user.userId);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Post('products')
  @HttpCode(201)
  async createProduct(@Body() param: ProductCreateParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createProduct(user.userId, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Put('products/:id')
  @HttpCode(201)
  async editProduct(@Param('id') id: string, @Body() param: ProductEditParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.editProduct(id, user.userId, param);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post()
  @HttpCode(201)
  async createShop(@Body() param: ShopPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createShop(user.userId, param);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Put()
  @HttpCode(201)
  async editShop(@Body() param: ShopPostParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.editShop(user.userId, param);
  }

  @Get(':id')
  async getShop(@Param('id') id: string) {
    return this.service.getShop(id) 
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('seller')
  @Get('order/list')
  list(@Query() {
    limit = 10,
    page = 1,
    status = '%%'
  }: OrderQueryParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.listSellerOrder({ limit, page, status }, user.userId)
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post('bank')
  @HttpCode(201)
  async createBank(@Body() param: SellerBankParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createBank(user.userId, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Put('bank/:id')
  @HttpCode(201)
  async editBank(@Body() param: EditSellerBankParam, @Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.editBank(user.userId, id, param);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Delete('bank/:id')
  @HttpCode(200)
  async deleteBank(@Param('id') id: string, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.deleteBank(user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Get('bank/:id')
  async listBank(@Param('id') id: string) {
    return this.service.listBank(id);
  }
}
