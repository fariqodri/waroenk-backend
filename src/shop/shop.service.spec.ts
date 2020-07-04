import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from './shop.service';
import { ProductRepository } from '../products/repositories/product.repository';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { CategoryRepository } from '../products/repositories/category.repository';

jest.mock('../products/repositories/product.repository')
jest.mock('../users/repositories/seller.repository')

describe('ShopService', () => {
  let service: ShopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopService, SellerAttributeRepository, ProductRepository, CategoryRepository, UserRepository],
    }).compile();

    service = module.get<ShopService>(ShopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
