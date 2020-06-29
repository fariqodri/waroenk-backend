import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from '../repositories/product.repository';
import { ProductQuery } from '../dto/product.dto';

jest.mock('../repositories/product.repository')

describe('Products Controller', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService, ProductRepository]
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call ProductsService', () => {
    const spy = jest.spyOn(service, "findAll").mockImplementation()
    let param = new ProductQuery;
    param.page = 1
    param.limit = 10
    controller.findAll(null, param.limit, param.page)
    expect(spy).toBeCalled()
  })
});
