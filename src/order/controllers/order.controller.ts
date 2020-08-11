import { Controller, UseGuards, Get, Query, Req, Delete, HttpCode, Body, Post, Put, UsePipes, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolePermissionGuard } from '../../auth/guards/role.permission.guard';
import { Roles } from '../../utils/decorators';
import { Request } from 'express';
import { ValidationPipe } from '../../utils/validation.pipe';
import { OrderService } from '../services/order.service';
import { CreateOrderParam, UpdateOrderParam } from '../dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private service: OrderService) {}

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Post()
  @HttpCode(201)
  checkout(@Body() param: CreateOrderParam, @Req() request: Request) {
    const user: { userId } = request.user as { userId }
    return this.service.createOrder(param, user.userId)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Put(':id')
  @HttpCode(201)
  update(@Param('id') id: string, @Body() param: UpdateOrderParam) {
    return this.service.updateOrder(id, param)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Put('finish/:id')
  @HttpCode(201)
  finish(@Param('id') id: string) {
    return this.service.finishOrder(id)
  }

  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @Roles('all')
  @Delete(':id')
  @HttpCode(201)
  cancel(@Param('id') id: string) {
    return this.service.cancelOrder(id)
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detailOrder(id)
  }
}
