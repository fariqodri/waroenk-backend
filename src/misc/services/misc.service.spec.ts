import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from './misc.service';
import { FaqRepository } from '../repositories/faq.repository';
import { LocationRepository } from '../repositories/location.repository';
import { CsvParser } from 'nest-csv-parser';
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

describe('Misc Service', () => {
  let service: MiscService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MiscService, 
        FaqRepository, 
        LocationRepository,
        CsvParser,
        UserRepository,
        SellerAttributeRepository,
        ProductRepository,
        CategoryRepository],
    }).compile();

    service = module.get<MiscService>(MiscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});