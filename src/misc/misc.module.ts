import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRepository } from './repositories/faq.repository';
import { FaqController } from './controllers/faq.controller';
import { MiscService } from './services/misc.service';
import { LocationRepository } from './repositories/location.repository';
import { LocationController } from './controllers/location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FaqRepository, LocationRepository])],
  controllers: [FaqController, LocationController],
  providers: [MiscService]
})
export class MiscModule {}
