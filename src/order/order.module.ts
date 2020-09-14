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
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { OrderProvider } from './providers/order.provider';

@Module({
  controllers: [CartController, OrderController],
  providers: [OrderService, OrderProvider],
  imports: [ScheduleModule.forRoot(), 
    TypeOrmModule.forFeature([
    CartRepository, 
    OrderRepository,
    OrderItemRepository,
    OrderRepository, 
    UserRepository, 
    ProductRepository,
    SellerAttributeRepository
  ])],
  exports: [TypeOrmModule.forFeature([CartRepository, OrderRepository, OrderItemRepository]), OrderProvider]
})
export class OrderModule {}
