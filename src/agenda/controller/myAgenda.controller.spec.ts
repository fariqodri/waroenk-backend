import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from '../services/agenda.service';
import { AgendaRepository } from '../repositories/agenda.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { MyAgendaController } from './myAgenda.controller';

jest.mock('../repositories/agenda.repository')

describe('Agenda Controller', () => {
  let controller: MyAgendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyAgendaController],
      providers: [AgendaService, AgendaRepository, UserRepository]
    }).compile();

    controller = module.get<MyAgendaController>(MyAgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
