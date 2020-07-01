import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { ProductRepository } from '../repositories/product.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

jest.mock('../repositories/product.repository')

describe('Products Controller', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService, ProductRepository, SellerAttributeRepository]
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call ProductsService', () => {
    const spy = jest.spyOn(service, "findAll").mockImplementation()
    controller.findAll({
      page: 10,
      limit: 1
    })
    expect(spy).toBeCalled()
  })
});
