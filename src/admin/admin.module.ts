import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/repositories/users.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { AdminService } from './services/admin.service';
import { AdminController } from './controller/admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      SellerAttributeRepository,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
