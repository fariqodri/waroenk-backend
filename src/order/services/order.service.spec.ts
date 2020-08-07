import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';

jest.mock('../../products/repositories/product.repository')
jest.mock('../../users/repositories/seller.repository')
jest.mock('../repositories/order.repository')
jest.mock('../repositories/cart.repository')
jest.mock('../repositories/order-item.repository')

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService, OrderRepository, OrderItemRepository, CartRepository, UserRepository, ProductRepository],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
