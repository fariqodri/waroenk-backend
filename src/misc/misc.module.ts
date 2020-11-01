import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRepository } from './repositories/faq.repository';
import { FaqController } from './controllers/faq.controller';
import { MiscService } from './services/misc.service';
import { LocationRepository } from './repositories/location.repository';
import { LocationController } from './controllers/location.controller';
import { CsvModule } from 'nest-csv-parser';
import { BulkUploadController } from './controllers/bulk-upload.controller';
import { SponsorController } from './controllers/sponsor.controller';
import { UserRepository } from '../users/repositories/users.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { SellerCategoryRepository } from '../products/repositories/seller-category.repository';
import { SponsorRepository } from './repositories/sponsor.repository';
import { SponsorService } from './services/sponsor.service';

@Module({
  imports: [
    CsvModule,
    TypeOrmModule.forFeature([
      FaqRepository,
      LocationRepository,
      UserRepository,
      SellerAttributeRepository,
      ProductRepository,
      CategoryRepository,
      SellerCategoryRepository,
      SponsorRepository
    ]),
  ],
  controllers: [FaqController, LocationController, BulkUploadController, SponsorController],
  providers: [MiscService, SponsorService],
  exports: [MiscService, SponsorService]
})
export class MiscModule {}
