import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from '../repositories/product.repository';

jest.mock('../repositories/product.repository')

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, ProductRepository],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
});
