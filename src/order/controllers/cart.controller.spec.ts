import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { OrderService } from '../services/order.service';
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

describe('Cart Controller', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [OrderService, OrderRepository, OrderItemRepository, CartRepository, UserRepository, ProductRepository]
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
