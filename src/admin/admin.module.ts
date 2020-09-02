import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/repositories/users.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { AdminService } from './services/admin.service';
import { AdminController } from './controller/admin.controller';
import { UsersModule } from '../users/users.module';
import { OrderRepository } from '../order/repositories/order.repository';
import { ProposalRepository } from '../proposal/repositories/proposal.repository';
import { DiscussionRepository } from '../discussion/repositories/discussion.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      SellerAttributeRepository,
      OrderRepository,
      ProposalRepository,
      DiscussionRepository
    ]),
    UsersModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
