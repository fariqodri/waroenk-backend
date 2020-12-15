import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';
import { LoggerModule } from 'nestjs-pino';


describe('Cart Controller', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        OrderService, 
        OrderRepository,
        OrderItemRepository, 
        CartRepository, 
        UserRepository, 
        ProductRepository,
        SellerAttributeRepository],
      imports: [LoggerModule.forRoot()]
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
