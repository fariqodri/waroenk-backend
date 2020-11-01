import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRepository } from './repositories/faq.repository';
import { FaqController } from './controllers/faq.controller';
import { MiscService } from './services/misc.service';
import { LocationRepository } from './repositories/location.repository';
import { LocationController } from './controllers/location.controller';
import { CsvModule } from 'nest-csv-parser';
import { BulkUploadController } from './controllers/bulk-upload.controller';
import { SliderController } from './controllers/slider.controller';
import { UserRepository } from '../users/repositories/users.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { SellerCategoryRepository } from '../products/repositories/seller-category.repository';
import { SliderRepository } from './repositories/slider.repository';
import { SliderService } from './services/slider.service';

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
      SliderRepository
    ]),
  ],
  controllers: [FaqController, LocationController, BulkUploadController, SliderController],
  providers: [MiscService, SliderService],
  exports: [MiscService, SliderService]
})
export class MiscModule {}
