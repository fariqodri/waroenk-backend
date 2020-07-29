import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqRepository } from './repositories/faq.repository';
import { FaqController } from './controllers/faq.controller';
import { MiscService } from './services/faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([FaqRepository])],
  controllers: [FaqController],
  providers: [MiscService],
  exports: [TypeOrmModule.forFeature([FaqRepository])]
})
export class MiscModule {}
