import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from '../services/misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';
import { BulkUploadController } from './bulk-upload.controller';

jest.mock('../repositories/faq.repository')
jest.mock('../repositories/location.repository')

describe('Faq Controller', () => {
  let controller: BulkUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkUploadController],
      providers: [MiscService, FaqRepository, LocationRepository, CsvParser]
    }).compile();

    controller = module.get<BulkUploadController>(BulkUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
