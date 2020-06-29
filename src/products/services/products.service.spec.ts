import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ResponseBody } from '../../utils/response';
import { ProductEntity } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery } from '../dto/product.dto';

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
