import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from '../order/repositories/order.repository';

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [ProductsModule, UsersModule, TypeOrmModule.forFeature([
    OrderRepository,
  ])],
  exports: [ShopService]
})
export class ShopModule {}
