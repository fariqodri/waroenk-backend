import { Test, TestingModule } from '@nestjs/testing';
import { AgendaController } from './agenda.controller';
import { AgendaService } from '../services/agenda.service';
import { AgendaRepository } from '../repositories/agenda.repository';
import { UserRepository } from '../../users/repositories/users.repository';

jest.mock('../repositories/agenda.repository')

describe('Agenda Controller', () => {
  let controller: AgendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [AgendaService, AgendaRepository, UserRepository]
    }).compile();

    controller = module.get<AgendaController>(AgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
