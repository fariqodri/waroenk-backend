import { Injectable } from "@nestjs/common";
import { FindOneOptions } from "typeorm";
import { OrderEntity } from "../entities/order.entity";
import { OrderRepository } from "../repositories/order.repository";

@Injectable()
export class OrderProvider {
  constructor(
    private readonly orderRepo: OrderRepository
  ) {}
  findOrderById(orderId: string, option?: FindOneOptions<OrderEntity>): Promise<OrderEntity> {
    return this.orderRepo.findOneOrFail(orderId, option)
  }
}