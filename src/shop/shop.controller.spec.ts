import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { SellerAttributeRepository } from '../users/repositories/seller.repository';
import { UserRepository } from '../users/repositories/users.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { CategoryRepository } from '../products/repositories/category.repository';
import { OrderRepository } from '../order/repositories/order.repository';
import { SellerBankRepository } from '../users/repositories/selle-bank.repository';
import { SellerCategoryRepository } from '../products/repositories/seller-category.repository';

describe('Shop Controller', () => {
  let controller: ShopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        ShopService, 
        SellerAttributeRepository,
        ProductRepository, 
        CategoryRepository, 
        UserRepository,
        OrderRepository,
        SellerBankRepository,
        SellerCategoryRepository
      ]
    }).compile();

    controller = module.get<ShopController>(ShopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
