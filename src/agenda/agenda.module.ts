import { Module } from '@nestjs/common';
import { AgendaService } from './services/agenda.service';
import { AgendaController } from './controller/agenda.controller';
import { AgendaRepository } from './repositories/agenda.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AgendaRepository])],
  controllers: [AgendaController],
  providers: [AgendaService],
  exports: [TypeOrmModule.forFeature([AgendaRepository])]
})
export class AgendaModule {}
