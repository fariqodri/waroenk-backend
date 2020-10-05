import { Injectable } from "@nestjs/common";
import { FindOneOptions } from "typeorm";
import { OrderEntity } from "../entities/order.entity";
import { OrderItemRepository } from "../repositories/order-item.repository";
import { OrderRepository } from "../repositories/order.repository";

@Injectable()
export class OrderProvider {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orderItemRepo: OrderItemRepository
  ) {}
  findOrderById(orderId: string, option?: FindOneOptions<OrderEntity>): Promise<OrderEntity> {
    return this.orderRepo.findOneOrFail(orderId, option)
  }

  countProductsOfOrder(orderId: string): Promise<number> {
    return this.orderItemRepo.count({
      where: {
        order: {
          id: orderId
        }
      }
    })
  }
}