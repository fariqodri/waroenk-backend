import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderController } from './order.controller';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

describe('Order Controller', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService, 
        OrderRepository,
        OrderItemRepository, 
        CartRepository, 
        UserRepository, 
        ProductRepository,
        SellerAttributeRepository],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
