import { Module } from '@nestjs/common';
import { ShopModule } from '../shop/shop.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
  imports: [ShopModule, TypeOrmModule.forFeature([PostRepository])],
  providers: [PostService],
  controllers: [PostController]
})
export class PostModule {}
