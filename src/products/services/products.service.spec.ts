import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from '../repositories/product.repository';
import { LocationRepository } from '../../misc/repositories/location.repository';

jest.mock('../repositories/product.repository')

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, ProductRepository, LocationRepository],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});
