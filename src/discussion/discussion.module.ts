import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionController } from './controller/discussion.controller';
import { DiscussionRepository } from './repositories/discussion.repository';
import { DiscussionService } from './services/discussion.service';
import { UserRepository } from '../users/repositories/users.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserRepository,
    ProductRepository, 
    DiscussionRepository,
    SellerAttributeRepository])],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [TypeOrmModule.forFeature([DiscussionRepository])]
})
export class DiscussionModule {}
