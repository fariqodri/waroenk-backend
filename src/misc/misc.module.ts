import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRepository } from './repositories/faq.repository';
import { FaqController } from './controllers/faq.controller';
import { MiscService } from './services/misc.service';
import { LocationRepository } from './repositories/location.repository';
import { LocationController } from './controllers/location.controller';
import { CsvModule } from 'nest-csv-parser'
import { BulkUploadController } from './controllers/bulk-upload.controller';

@Module({
  imports: [CsvModule, TypeOrmModule.forFeature([FaqRepository, LocationRepository])],
  controllers: [FaqController, LocationController, BulkUploadController],
  providers: [MiscService]
})
export class MiscModule {}
