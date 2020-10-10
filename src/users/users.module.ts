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
import { SellerBankRepository } from './repositories/seller-bank.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  providers: [UsersService, UsersProvider],
  exports: [UsersService, TypeOrmModule.forFeature([SellerAttributeRepository, SellerBankRepository, UserRepository]), UsersProvider],
  controllers: [UsersController],
  imports: [PermissionModule,
    MiscModule,
    TypeOrmModule.forFeature([UserRepository, SellerAttributeRepository, ShippingAddressRepository]),
    MailerModule.forRoot({
      transport: {
        host: 'srv80.niagahoster.com',
        port: 465,
        secure: true,
        auth: {
          user: "admin@bukawaroenk.co.id",
          pass: "210271Admin",
        },
      },
      defaults: {
        from:'"no-reply" <mail@bukawaroenk.co.id>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    })
  ],
})
export class UsersModule {}