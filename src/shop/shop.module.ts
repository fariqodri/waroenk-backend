import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from '../order/repositories/order.repository';
import { ShopProvider } from './shop.provider';

@Module({
  controllers: [ShopController],
  providers: [ShopService, ShopProvider],
  imports: [ProductsModule, UsersModule, TypeOrmModule.forFeature([
    OrderRepository,
  ])],
  exports: [ShopProvider]
})
export class ShopModule {}
