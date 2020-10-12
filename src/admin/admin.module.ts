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
import { AgendaRepository } from '../agenda/repositories/agenda.repository';
import { SellerCategoryRepository } from '../products/repositories/seller-category.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { NotificationService } from './services/notification.service';
import { ChatModule } from '../chat/chat.module';
import { ProposalDataRepository } from '../proposal/repositories/proposal-data.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      SellerAttributeRepository,
      OrderRepository,
      ProposalRepository,
      ProposalDataRepository,
      DiscussionRepository,
      AgendaRepository,
      SellerCategoryRepository,
      CategoryRepository
    ]),
    UsersModule,
    ChatModule
  ],
  controllers: [AdminController],
  providers: [AdminService, NotificationService]
})
export class AdminModule {}
