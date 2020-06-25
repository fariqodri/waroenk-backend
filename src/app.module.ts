import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './redis/redis.module';
import * as config from "./ormconfig";
import { REDIS_URL } from './constants';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    ProductsModule,
    PermissionModule,
    RedisModule.register({
      url: REDIS_URL
    })
  ],
})
export class AppModule {}
