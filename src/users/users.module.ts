import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { PermissionModule } from '../permission/permission.module';
import { UserRepository } from './repositories/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerAttributeRepository } from './repositories/seller.repository';
import { ShippingAddressRepository } from './repositories/shipping-address.repository';
import { MiscModule } from '../misc/misc.module';
import { UsersProvider } from './providers/users.provider';
import { SellerBankRepository } from './repositories/selle-bank.repository';

@Module({
  providers: [UsersService, UsersProvider],
  exports: [UsersService, TypeOrmModule.forFeature([SellerAttributeRepository, SellerBankRepository]), UsersProvider],
  controllers: [UsersController],
  imports: [PermissionModule, MiscModule, TypeOrmModule.forFeature([UserRepository, SellerAttributeRepository, ShippingAddressRepository])],
})
export class UsersModule {}