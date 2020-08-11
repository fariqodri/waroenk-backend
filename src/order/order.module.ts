import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './controllers/cart.controller';
import { OrderService } from './services/order.service';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderRepository } from './repositories/order.repository';
import { CartRepository } from './repositories/cart.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { OrderController } from './controllers/order.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [CartController, OrderController],
  providers: [OrderService],
  imports: [ScheduleModule.forRoot(), 
    TypeOrmModule.forFeature([
    CartRepository, 
    OrderRepository,
    OrderItemRepository,
    OrderRepository, 
    UserRepository, 
    ProductRepository,
  ])],
  exports: [TypeOrmModule.forFeature([CartRepository, OrderRepository, OrderItemRepository])]
})
export class OrderModule {}
