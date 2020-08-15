import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [ProductsModule, UsersModule],
  exports: [ShopService]
})
export class ShopModule {}
