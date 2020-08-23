import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { SellerAttributeRepository } from '../../users/repositories/seller.repository';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService, 
        OrderRepository,
        OrderItemRepository, 
        CartRepository, 
        UserRepository, 
        ProductRepository,
        SellerAttributeRepository],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
