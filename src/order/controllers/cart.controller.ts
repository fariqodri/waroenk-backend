import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body, Post, Put, UsePipes, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../../auth/guards/role.permission.guard';
import { Roles } from '../../utils/decorators';
import { Request } from 'express';
import { ValidationPipe } from '../../utils/validation.pipe';
import { OrderService } from '../services/order.service';
import { CreateCartParam } from '../dto/order.dto';

@Controller('cart')
export class CartController {
  constructor(private service: OrderService) {}

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Get()
  getProducts(@Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.listCart(user.userId)
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post()
  @HttpCode(201)
  async createProduct(@Body() param: CreateCartParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.addCart(param,user.userId);
  }
}
