import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from './misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';

jest.mock('../repositories/faq.repository')
jest.mock('../repositories/location.repository')

describe('Faq Service', () => {
  let service: MiscService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiscService, FaqRepository, LocationRepository, CsvParser],
    }).compile();

    service = module.get<MiscService>(MiscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});