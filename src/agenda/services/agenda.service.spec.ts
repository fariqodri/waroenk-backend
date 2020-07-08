import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from './agenda.service';
import { AgendaRepository } from '../repositories/agenda.repository';

jest.mock('../repositories/agenda.repository')


describe('Agenda Service', () => {
  let service: AgendaService;
  let agendaRepo: AgendaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgendaService, AgendaRepository],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
    agendaRepo = module.get(AgendaRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});