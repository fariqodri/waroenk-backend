import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../../users/repositories/users.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderController } from './order.controller';

jest.mock('../../products/repositories/product.repository')
jest.mock('../../users/repositories/seller.repository')
jest.mock('../repositories/order.repository')
jest.mock('../repositories/cart.repository')
jest.mock('../repositories/order-item.repository')

describe('Order Controller', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService, OrderRepository, OrderItemRepository, CartRepository, UserRepository, ProductRepository]
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
