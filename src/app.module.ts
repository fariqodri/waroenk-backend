import { Controller, Get, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DiscussionModule } from './discussion/discussion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './redis/redis.module';
import * as config from "./ormconfig";
import { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from './constants';
import { ShopModule } from './shop/shop.module';
import { AgendaModule } from './agenda/agenda.module';
import { FileUploadModule } from './file.upload/file.upload.module';
import { MiscModule } from './misc/misc.module';
import { ProposalModule } from './proposal/proposal.module';
import { OrderModule } from './order/order.module';
import { ChatModule } from './chat/chat.module';
import { PostModule } from './post/post.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from 'nestjs-pino';

@Controller('health')
class HealthController {
  @Get()
  health() {
    return 'alive'
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    ProductsModule,
    PermissionModule,
    AgendaModule,
    DiscussionModule,
    ShopModule,
    FileUploadModule,
    MiscModule,
    ProposalModule,
    OrderModule,
    RedisModule.register({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    }),
    ChatModule,
    PostModule,
    AdminModule,
    LoggerModule.forRoot()
  ],
  controllers: [HealthController]
})
export class AppModule {}
