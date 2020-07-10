import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './redis/redis.module';
import * as config from "./ormconfig";
import { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from './constants';
import { ShopModule } from './shop/shop.module';
import { AgendaModule } from './agenda/agenda.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    ProductsModule,
    PermissionModule,
    AgendaModule,
    RedisModule.register({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    }),
    ShopModule
  ],
})
export class AppModule {}
