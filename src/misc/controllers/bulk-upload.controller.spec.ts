import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from '../services/misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';
import { BulkUploadController } from './bulk-upload.controller';
import { UserRepository } from '../../users/repositories/users.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { CategoryRepository } from '../../products/repositories/category.repository';

jest.mock('../repositories/faq.repository')
jest.mock('../repositories/location.repository')
jest.mock('../../users/repositories/users.repository')
jest.mock('../../users/repositories/seller.repository')
jest.mock('../../products/repositories/product.repository')
jest.mock('../../products/repositories/category.repository')

describe('Bulk Upload Controller', () => {
  let controller: BulkUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkUploadController],
      providers: [
        MiscService, 
        FaqRepository, 
        LocationRepository,
        CsvParser,
        UserRepository,
        SellerAttributeRepository,
        ProductRepository,
        CategoryRepository]
    }).compile();

    controller = module.get<BulkUploadController>(BulkUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
