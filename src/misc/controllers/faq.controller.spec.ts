import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { MiscService } from '../services/misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';

jest.mock('../repositories/faq.repository')
jest.mock('../repositories/location.repository')

describe('Faq Controller', () => {
  let controller: FaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [MiscService, FaqRepository, LocationRepository, CsvParser]
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
